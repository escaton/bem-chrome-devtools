chrome.devtools.panels.elements.createSidebarPane("BEM", function(sidebar) {

    function calcWindowDimensions() {
        return {
            innerHeight: window.innerHeight,
            height: window.outerHeight - window.innerHeight,
            width: window.outerWidth - window.innerWidth
        }
    };

    function ajastHeight() {
        chrome.devtools.inspectedWindow.eval('(' + calcWindowDimensions.toString() + ')()', (result, error) => {
            var threshold = 160;
            var heightStyle = '100vh - 54px';
            var heightThreshold = result.height > threshold;
            if (heightThreshold) {
                heightStyle += ' - ' + result.innerHeight + 'px - 1px';
            }
            sidebar.setHeight('calc(' + heightStyle + ')');
        });
    }

    sidebar.setHeight('calc(100vh - 54px)');
    sidebar.setPage('pages/bem-sidebar/bem-sidebar.html');

    var sidebarWindow;
    sidebar.onShown.addListener((_sidebarWindow) => {
        setTimeout(ajastHeight, 100);
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
