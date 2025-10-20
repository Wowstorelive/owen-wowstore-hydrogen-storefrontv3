import {Link} from './Link';
import {
  IconFacebook,
  IconInstagram,
  IconYoutube,
  IconTwitter,
  IconPinterest,
} from './Icon';

export function Social({socials}: {socials: any}) {
  if (!socials) {
    return null;
  }

  return (
    <>
      <Link to={socials?.facebook} target="_blank" aria-label="facebook">
        <IconFacebook className="inline-block mx-2 my-1" />
      </Link>

      <Link to={socials?.twitter} target="_blank" aria-label="twitter">
        <IconTwitter className="inline-block mx-2 my-1" />
      </Link>

      <Link to={socials?.instagram} target="_blank" aria-label="instagram">
        <IconInstagram className="inline-block mx-2 my-1" />
      </Link>

      <Link to={socials?.pinterest} target="_blank" aria-label="pinterest">
        <IconPinterest className="inline-block mx-2 my-1" />
      </Link>

      <Link to={socials?.youtube} target="_blank" aria-label="youtube">
        <IconYoutube className="inline-block mx-2 my-1" />
      </Link>
    </>
  );
}
