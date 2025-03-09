:::: div .header

```css scope
& {
	display: flex;
	color: white;
	padding: 16px 20px 0 20px;
	margin: auto;
	max-width: 1200px;
	min-width: 630px;
	flex-flow: row wrap;

	text-shadow:
		2px 0 #000000,
		-2px 0 #000000,
		0 2px #000000,
		0 -2px #000000,
		1px 1px #000000,
		-1px -1px #000000,
		1px -1px #000000,
		-1px 1px #000000;
}

p {
	margin: 0;
}
```

::: div .profile-image

```css scope
img {
	height: 180px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
```

![照片](assets/profile.jpg)
:::

::: div .basic

```css scope
& {
	white-space: nowrap;
	flex: 1;
	display: flex;
	flex-direction: column;
	margin: 50px 20px 40px;
	flex-basis: 124px;
	position: relative;
}
h1 {
	margin-bottom: 0.4em;
}
p:last-child {
	@media (min-width: 630px) {
		position: absolute;
		text-shadow: none;
		color: black;
	}
	margin-top: 0.4em;
	top: 115px;
}
```

# 宋仁博

全栈工程师

_熟练掌握面向AI编程，GitHub Copilot忠实用户_

:::

::: div .contact

```css scope
& {
	margin: 50px 20px 40px;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	font-size: 17px;
}
thead {
	display: none;
}
td:first-child {
	text-align: center;
	font-family: Symbols Nerd Font;
}

@media (min-width: 630px) {
	h3 {
		display: none;
	}
}
```

### 联系方式

| 项目 | 内容                     |
| ---- | ------------------------ |
|     | 13264051941              |
| 󰇰    | 524702837@qq.com         |
|     | https://github.com/gongt |

:::

::::
