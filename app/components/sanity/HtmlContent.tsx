export function HtmlContent({data}: {data: any}) {
  return (
    <div className="prose mb-12 md:mb-20" style={{margin: data?.margin}}>
      <div
        className={data.fullWidth == true ? '' : 'container'}
        style={{maxWidth: data?.maxWidth}}
      >
        <div dangerouslySetInnerHTML={{__html: data.htmlContent}} />
      </div>
    </div>
  );
}
