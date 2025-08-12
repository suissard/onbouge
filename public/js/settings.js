document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const dataType = params.get('page');

    const titleElement = document.getElementById('settings-title');
    const contentElement = document.getElementById('settings-content');

    if (dataType) {
        titleElement.textContent = `Settings for ${dataType}`;
        contentElement.textContent = `This is where the settings for ${dataType} will be.`;
    } else {
        titleElement.textContent = 'Settings';
        contentElement.textContent = 'Please specify a data type in the URL, e.g., /settings/events.';
    }
});
