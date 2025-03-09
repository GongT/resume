import { Button } from '@fluentui/react-components';

function App() {
	return <Button appearance="primary">Get started</Button>;
}

import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('container')!);

root.render(
	<FluentProvider theme={webLightTheme}>
		<App />
	</FluentProvider>,
);
