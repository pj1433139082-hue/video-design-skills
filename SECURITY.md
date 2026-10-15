# 安全政策 (Security Policy)

本仓库是**文档与技能卡片仓库**：内容以 Markdown 为主，另含少量 shell / Python 核查脚本
（`.github/scripts/check_structure.py`、`docs/verification/consistency-checks.sh`）。
它不打包运行时代码，也不分发依赖。所以这里的「安全」主要不是漏洞利用，而是：

- 误提交凭据、Token、账号设置、内网地址或本机绝对路径；
- 误提交真实素材与生成媒体；
- 文档给出**未经核实的许可 / 授权 / 合规断言**（例如声称某个引用「已获授权」）。

---

## 支持的版本 (Supported Versions)

本仓库只维护 `main`：

| 版本 / 分支 | 支持 | 备注 |
| :--- | :--- | :--- |
| `main` | ✅ 支持 | 唯一维护分支 |
| 历史提交、已删除的特性分支 | ❌ 不再支持 | 请以 `main` 最新代码为准 |

---

## 已启用的仓库保护

- **Secret scanning**：启用。
- **Push protection**：启用（推送内容中含可识别的密钥会被直接拒绝）。
- **`main` 分支保护**：禁止强推、禁止删除；合并前必须 `checks` 状态检查通过。

---

## 上报漏洞或泄漏 (Reporting a Vulnerability or Leak)

**请不要开公开 issue。** 公开等于把问题连同细节一起发布。

请发邮件到：**pj1433139082@gmail.com**

> 为什么不是 GitHub 的私密报告入口：本仓库位于个人账号下，
> **GitHub 的 Private vulnerability reporting 未启用**，
> 因此 `https://github.com/pj1433139082-hue/video-design-skills/security/advisories/new`
> 会返回 404。上面的邮箱是该账号资料页上**已公开**的联系方式，是目前唯一可用的私密渠道。

报告里请尽量包含：

- 涉及的文件路径与行号，或 commit SHA；
- 风险类型（凭据 / 私有素材 / 内网路径 / 未核实的许可或授权声明等）；
- 最小复现：触发问题的命令，或指出哪一句文档断言与事实不符；
- 你建议的处置方式。

---

## 响应与处置

本仓库由个人维护，**不承诺响应时限（SLA）**。收到报告后会尽快确认；确认属实的，
先修复 `main`，再视情况清理历史，并在征得报告人同意的前提下致谢。

若你怀疑某个第三方资源（字体、音效、模板、参考站内容等）的许可状态不明，
也请按上面的邮箱联系——这类问题同样不该开公开 issue。
