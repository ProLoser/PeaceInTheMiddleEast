export default function Version() {
    const onClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
        }
        // Delete all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        // Force reload from server
        window.location.reload();
    };

    return (
        <li>
            <a href="#" onClick={onClick}>
                <span className="material-icons notranslate">update</span>
                {VITE_VERSION}
            </a>
        </li>
    );
}
