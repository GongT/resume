```css inline
:root {
	--primary-color: #185abd;
	--background-color: #e8f1ff;
}

font-face {
	font-family: 'Symbols Nerd Font';
	src: url('assets/SymbolsNerdFontMono-Regular.ttf') format('truetype');
}
body {
	margin: 16px 0;
	font-family:
		微软雅黑,
		文泉驿正黑,
		-apple-system,
		BlinkMacSystemFont,
		sans-serif;
}
.header {
	max-width: 950px;
}
.body {
	margin: 20px auto;
	max-width: 800px;
	min-width: 600px;
	padding: 0 16px;
}
ul {
	margin-block: 0;
}

h1 {
	margin-bottom: 0;
}

.detail,
.experience,
.projects {
	> h1 {
		background: url(assets/corner.png) no-repeat -520px 0;
		border-bottom: 4px solid #85b5ff;
		padding: 0 0.3em;
	}
}

section {
	margin: 1em 0;
	padding: 0.6em 15px;

	h2 {
		margin: 0.2em 0;
	}
	h4 {
		margin: 0.7em 0;
		&:first-child {
			margin-top: 0;
		}
	}

	info {
		display: flex;
		flex-direction: row;
		align-items: center;

		padding-bottom: 0.8em;
		margin-bottom: 0.8em;
		border-bottom: 2px solid var(--primary-color);

		ul {
			margin-left: 2em;
			list-style: none;
			padding: 0;
		}
	}
	&:nth-child(even) {
		background-color: var(--background-color);
	}
}
```
