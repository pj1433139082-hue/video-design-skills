# 视频品味档案（Video Taste Profile）

> 用户视频品味的历史档案，consult Phase 0/1 读取。维度比网页版多 caption_style / pacing。

## 模板（.taste-profile.json）

```json
{
  "video": {
    "platforms": ["抖音", "B站", "小红书"],
    "aspect_prefs": ["9:16", "16:9"],
    "moods": ["锐利数据", "温暖叙事", "专业克制", "创意节奏"],
    "fonts": ["Noto Sans SC", "ZCOOL XiaoWei"],
    "palette_hints": ["深底亮色", "奶油底"],
    "caption_style": ["word", "line", "none"],
    "pacing": ["快节奏 4-5字/s", "中速 3-4字/s"],
    "motion": ["spring 弹性", "克制 fade"],
    "avoid": ["紫渐变", "typewriter 滥用", "emoji 装饰"]
  }
}
```

## 何时更新
consult Phase 1 澄清后，若用户表达明确偏好（"我喜欢 xxx 的字幕""讨厌 xxx 转场"），追加到档案。
