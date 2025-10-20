import {PortableText as Text} from '@portabletext/react';

import {Grid} from '~/components/elements/Grid';

export function PortableText({data}: {data: any}) {
  return (
    <div className="mb-12 md:mb-20" style={{margin: data?.margin}}>
      <div className="container" style={{maxWidth: data?.maxWidth}}>
        <Grid items={data.column ? data.column : 1}>
          {data.bodyItems.map((item: any, index: number) => {
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="article"
                style={{textAlign: data.textAlign}}
              >
                <Text value={item.body} />
              </div>
            );
          })}
        </Grid>
      </div>
    </div>
  );
}
