chrome.devtools.panels.elements.createSidebarPane("BEM", function(sidebar) {
    sidebar.setHeight('calc(100vh - 54px)');
    sidebar.setPage('pages/bem-sidebar/bem-sidebar.html');
    var sidebarWindow;
    sidebar.onShown.addListener((_sidebarWindow) => {
        sidebarWindow = _sidebarWindow;
        sidebarWindow.postMessage({
            cmd: 'sidebar-status',
            value: 'shown'
        }, '*');
    });
    sidebar.onHidden.addListener(() => {
        sidebarWindow && sidebarWindow.postMessage({
            cmd: 'sidebar-status',
            value: 'hidden'
        }, '*');
    });
});
