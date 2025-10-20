export function Instagram({module}: {module: any}) {
  return (
    <div className="mb-12 md:mb-20 relative" style={{margin: module?.margin}}>
      <div className={module.fullWidth == true ? '' : 'container'}>
        <div className="absolute z-10 left-0 right-0 w-4 mx-auto top-1/2 -translate-y-1/2 flex justify-center">
          <a
            href={module.url}
            target="_blank"
            className="text-xl font-thin bg-white rounded px-6 py-2"
            rel="noreferrer"
          >
            {module.title}
          </a>
        </div>
        <div
          className="relative overflow-hidden w-full"
          style={{paddingTop: module.height}}
        >
          <script src="https://snapwidget.com/js/snapwidget.js"></script>
          <iframe
            title="Instagram"
            src={'https://snapwidget.com/embed/' + module.embedId}
            id="instagram-widget"
            className="absolute top-0 left-0 bottom-0 right-0 w-full h-full"
            frameBorder="0"
            scrolling="no"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
