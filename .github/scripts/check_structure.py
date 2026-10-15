#!/usr/bin/env python3
"""结构核查：技能卡片 frontmatter + issue 模板语法 + YAML / JSON 可解析性。

用途（CI seam）：把「每个 skills/<dir>/SKILL.md 的 YAML frontmatter 完整、
name 与目录名一致、description 非空」「.github/ISSUE_TEMPLATE 下的模板符合
GitHub issue form 语法」以及「仓库内 YAML / JSON 均可解析」变成机械可查的
断言，作为拉取请求的必需状态检查入口。

运行：python3 .github/scripts/check_structure.py
退出码：0 = 全部 PASS；1 = 有 FAIL。

依赖：标准库 + pyyaml（缺失时 YAML 级校验记为 NOTE 而非通过）。

纪律（来自仓库根 AGENTS.md 与 README 的发布范围声明）：
  静态结构核查不等于渲染成功或视觉验收，也不断言技能在全新环境可一键运行。
  未运行的检查不写通过——本脚本只声明它实际执行的检查，缺依赖的检查记为 NOTE。

本脚本不核查单源数字、共享库查找顺序、动效库组件数或对比度口径——那些属于
ticket #3 的 docs/verification/consistency-checks.sh，两者互不重复。
"""

from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SKILLS_DIR = ROOT / "skills"
ISSUE_TEMPLATE_DIR = ROOT / ".github" / "ISSUE_TEMPLATE"

# GitHub issue form 允许的元素类型
BODY_TYPES = {"markdown", "input", "textarea", "dropdown", "checkboxes"}
# 这些类型必须带 id 与 attributes.label
FIELD_TYPES = {"input", "textarea", "dropdown", "checkboxes"}

RESULTS: list[tuple[str, str]] = []


def _record(level: str, msg: str) -> None:
    RESULTS.append((level, msg))
    print(f"{level:<4}  {msg}")


def ok(msg: str) -> None:
    _record("PASS", msg)


def bad(msg: str) -> None:
    _record("FAIL", msg)


def warn(msg: str) -> None:
    _record("WARN", msg)


def note(msg: str) -> None:
    _record("NOTE", msg)


def load_yaml():
    """返回 pyyaml 模块；缺失时返回 None（调用方记为 NOTE，不记为通过）。"""
    try:
        import yaml  # type: ignore[import-untyped]
    except ImportError:
        return None
    return yaml


# ---------------------------------------------------------------- 技能卡片


def parse_frontmatter(path: pathlib.Path) -> str | None:
    """返回 SKILL.md 的 frontmatter 文本；第 1 行不是 --- 时返回 None。"""
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    for index, line in enumerate(lines[1:], start=2):
        if line.strip() == "---":
            return "\n".join(lines[1 : index - 1])
    # 没有闭合分隔符：返回剩余内容，交由字段检查报错
    return "\n".join(lines[1:])


def frontmatter_field(frontmatter: str, key: str) -> str | None:
    """取顶层 key 的值（去引号）。按行首匹配，够用于 SKILL.md frontmatter。"""
    prefix = f"{key}:"
    for line in frontmatter.splitlines():
        if line.startswith(prefix):
            return line[len(prefix) :].strip().strip("\"'")
    return None


def check_skills() -> None:
    if not SKILLS_DIR.is_dir():
        bad("skills/ 目录不存在")
        return

    skill_dirs = sorted(d for d in SKILLS_DIR.iterdir() if d.is_dir())
    if not skill_dirs:
        bad("skills/ 下没有任何技能目录")
        return

    for skill_dir in skill_dirs:
        skill_md = skill_dir / "SKILL.md"
        rel = skill_md.relative_to(ROOT).as_posix()

        if not skill_md.is_file():
            bad(f"{rel} 缺失（技能目录必须自带触发面 SKILL.md）")
            continue

        if b"\r\n" in skill_md.read_bytes():
            warn(
                f"{rel} 工作区副本含 CRLF（仓库存储为 LF；多为本机 "
                "core.autocrlf 检出所致，可忽略）"
            )

        frontmatter = parse_frontmatter(skill_md)
        if frontmatter is None:
            bad(f"{rel} 第 1 行不是 '---'，缺少 YAML frontmatter")
            continue

        name = frontmatter_field(frontmatter, "name")
        if name != skill_dir.name:
            bad(
                f"{rel} frontmatter name={name!r} 必须与目录名 "
                f"{skill_dir.name!r} 一致"
            )
        else:
            ok(f"{rel} frontmatter name 与目录名一致（{skill_dir.name}）")

        description = frontmatter_field(frontmatter, "description")
        if not description:
            bad(f"{rel} frontmatter 缺少非空 description（该字段决定技能何时被触发）")
        else:
            ok(f"{rel} frontmatter description 非空（{len(description)} 字）")


# ------------------------------------------------------- issue form 语法核查


def _form_problems(data: dict) -> list[str]:
    """核查一个 issue form 模板（非 config.yml）是否符合 GitHub 语法。"""
    problems: list[str] = []

    for key in ("name", "description"):
        value = data.get(key)
        if not isinstance(value, str) or not value.strip():
            problems.append(f"缺少非空 {key}")
    if "title" in data and not isinstance(data["title"], str):
        problems.append("title 必须是字符串")

    labels = data.get("labels")
    if labels is not None and (
        not isinstance(labels, list)
        or not all(isinstance(item, str) and item.strip() for item in labels)
    ):
        problems.append("labels 必须是非空字符串数组")

    body = data.get("body")
    if not isinstance(body, list) or not body:
        problems.append("body 必须是非空数组")
        return problems

    seen_ids: set[str] = set()
    for index, item in enumerate(body):
        where = f"body[{index}]"
        if not isinstance(item, dict):
            problems.append(f"{where} 必须是映射")
            continue

        element_type = item.get("type")
        if element_type not in BODY_TYPES:
            problems.append(
                f"{where} type={element_type!r} 不是 {sorted(BODY_TYPES)} 之一"
            )
            continue

        attributes = item.get("attributes")
        if not isinstance(attributes, dict):
            problems.append(f"{where} 缺少 attributes 映射")
            continue

        validations = item.get("validations")

        if element_type == "markdown":
            if validations is not None:
                problems.append(f"{where} markdown 元素不允许 validations")
            if not isinstance(attributes.get("value"), str) or not attributes[
                "value"
            ].strip():
                problems.append(f"{where} markdown 缺少非空 value")
            continue

        identifier = item.get("id")
        if not isinstance(identifier, str) or not identifier.strip():
            problems.append(f"{where} 缺少 id")
        elif identifier in seen_ids:
            problems.append(f"{where} id={identifier!r} 重复")
        else:
            seen_ids.add(identifier)

        if not isinstance(attributes.get("label"), str) or not attributes[
            "label"
        ].strip():
            problems.append(f"{where} 缺少非空 label")

        if validations is not None and (
            not isinstance(validations, dict)
            or not isinstance(validations.get("required", False), bool)
        ):
            problems.append(f"{where} validations.required 必须是布尔值")

        if element_type == "dropdown":
            options = attributes.get("options")
            if (
                not isinstance(options, list)
                or not options
                or not all(isinstance(opt, str) and opt.strip() for opt in options)
            ):
                problems.append(f"{where} dropdown 的 options 必须是非空字符串数组")

        if element_type == "checkboxes":
            options = attributes.get("options")
            if not isinstance(options, list) or not options:
                problems.append(f"{where} checkboxes 的 options 必须是非空数组")
            else:
                for option_index, option in enumerate(options):
                    if (
                        not isinstance(option, dict)
                        or not isinstance(option.get("label"), str)
                        or not option["label"].strip()
                    ):
                        problems.append(
                            f"{where}.options[{option_index}] 缺少非空 label"
                        )

    return problems


def _config_problems(data: dict) -> list[str]:
    """核查 .github/ISSUE_TEMPLATE/config.yml。"""
    problems: list[str] = []

    if "blank_issues_enabled" in data and not isinstance(
        data["blank_issues_enabled"], bool
    ):
        problems.append("blank_issues_enabled 必须是布尔值")

    links = data.get("contact_links")
    if links is None:
        return problems
    if not isinstance(links, list):
        problems.append("contact_links 必须是数组")
        return problems

    for index, link in enumerate(links):
        where = f"contact_links[{index}]"
        if not isinstance(link, dict):
            problems.append(f"{where} 必须是映射")
            continue
        for key in ("name", "url", "about"):
            if not isinstance(link.get(key), str) or not link[key].strip():
                problems.append(f"{where} 缺少非空 {key}")
        url = link.get("url")
        if isinstance(url, str) and not url.startswith("https://"):
            problems.append(f"{where} url 必须以 https:// 开头")

    return problems


def check_issue_templates(yaml_module) -> None:
    if yaml_module is None:
        note("issue 模板语法未核查：缺少 pyyaml（CI 中由 workflow 安装）")
        return
    if not ISSUE_TEMPLATE_DIR.is_dir():
        note(".github/ISSUE_TEMPLATE/ 不存在，无可核查的 issue 模板")
        return

    files = sorted(ISSUE_TEMPLATE_DIR.glob("*.yml"))
    if not files:
        note(".github/ISSUE_TEMPLATE/ 下没有 .yml 模板")
        return

    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        try:
            data = yaml_module.safe_load(path.read_text(encoding="utf-8"))
        except yaml_module.YAMLError as exc:
            first_line = str(exc).splitlines()[0] if str(exc) else "YAML 错误"
            bad(f"{rel} 无法解析：{first_line}")
            continue

        if not isinstance(data, dict):
            bad(f"{rel} 顶层必须是映射")
            continue

        problems = (
            _config_problems(data)
            if path.name == "config.yml"
            else _form_problems(data)
        )
        if problems:
            for problem in problems:
                bad(f"{rel} {problem}")
        else:
            ok(f"{rel} 符合 GitHub issue form 语法")


# ------------------------------------------------------------ YAML / JSON


def check_yaml(yaml_module) -> None:
    if yaml_module is None:
        note("YAML 级校验未运行：缺少 pyyaml（CI 中由 workflow 安装）")
        return

    files = sorted(
        p
        for p in list(ROOT.rglob("*.yml")) + list(ROOT.rglob("*.yaml"))
        if ".git" not in p.parts
    )
    if not files:
        note("仓库内没有 YAML 文件，无可解析性可查")
        return

    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        try:
            yaml_module.safe_load(path.read_text(encoding="utf-8"))
        except yaml_module.YAMLError as exc:
            first_line = str(exc).splitlines()[0] if str(exc) else "YAML 错误"
            bad(f"{rel} 无法解析：{first_line}")
        else:
            ok(f"{rel} 可解析")


def check_json() -> None:
    files = sorted(p for p in ROOT.rglob("*.json") if ".git" not in p.parts)
    if not files:
        note("仓库内没有 JSON 文件，无可解析性可查")
        return

    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            bad(f"{rel} 无法解析：{exc}")
        else:
            ok(f"{rel} 可解析")


# ---------------------------------------------------------------- 入口


def main() -> int:
    print(f"仓库根：{ROOT}\n")
    yaml_module = load_yaml()

    print("— 技能卡片 frontmatter —")
    check_skills()

    print("\n— issue 模板语法 —")
    check_issue_templates(yaml_module)

    print("\n— YAML 可解析性 —")
    check_yaml(yaml_module)

    print("\n— JSON 可解析性 —")
    check_json()

    levels = ("PASS", "FAIL", "WARN", "NOTE")
    counts = {level: sum(1 for lv, _ in RESULTS if lv == level) for level in levels}
    fails = [msg for level, msg in RESULTS if level == "FAIL"]

    print(
        f"\n合计：{counts['PASS']} PASS / {counts['FAIL']} FAIL / "
        f"{counts['WARN']} WARN / {counts['NOTE']} NOTE"
    )

    if fails:
        print("\n未通过：")
        for msg in fails:
            print(f"  - {msg}")
        return 1

    print(
        "\n本脚本只核查结构、issue 模板语法与 YAML/JSON 可解析性；"
        "不涉及渲染、视觉验收或运行环境可用性。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
