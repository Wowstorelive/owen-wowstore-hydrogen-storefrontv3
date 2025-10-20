import {PortableText} from '@portabletext/react';
import {Link} from '~/components/elements/Link';
import clsx from 'clsx';

export function PortableTextContent({
  data,
  classes,
}: {
  data: any;
  classes?: string;
}) {
  const styles = clsx(classes, 'w-full max-w-full article');

  return (
    <div className={styles}>
      <PortableText value={data} components={components} />
    </div>
  );
}

const components = {
  marks: {
    linkExternal: ({children, value}: {children: any; value: any}) => {
      const rel = !value.slug.startsWith('/')
        ? 'noreferrer noopener'
        : undefined;
      return (
        <Link to={value.slug} rel={rel} className="underline">
          {children[0]?.props?.markType === 'link'
            ? children[0]?.props?.text
            : children}
        </Link>
      );
    },
  },
  block: {
    normal: ({children}: {children: any}) => {
      const regHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
      const isHTML = regHTML(children);
      if (isHTML) {
        const formatHtml = children.filter(
          (item: any) => typeof item !== 'object',
        );
        const joinContent = formatHtml.join('');
        return <div dangerouslySetInnerHTML={{__html: joinContent}} />;
      } else {
        return <p>{children}</p>;
      }
    },
  },
};
