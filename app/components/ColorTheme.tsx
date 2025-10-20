export function ColorTheme({colorTheme}: {colorTheme: any}) {
  const {
    typography,
    body,
    header,
    footer,
    navigation,
    primaryButton,
    secondaryButton,
  } = colorTheme;

  if (
    !typography &&
    !body &&
    !header &&
    !footer &&
    !navigation &&
    !primaryButton &&
    !secondaryButton
  ) {
    return null;
  }

  return (
    <style
      id="theme-color"
      dangerouslySetInnerHTML={{
        __html: `
            body, .text-base {
              font-size: ${typography?.fontSize};
            }
            .body-style {
              background: ${body?.backgroundColor};
              color: ${body?.textColor};
            }
            body .article * {
              color: ${body?.textColor};
            }
            .header-style {
              background: ${header?.backgroundColor};
              color: ${header?.textColor};
            }
            .header-mobile-style {
              background: ${header?.headerMobileBg};
              color: ${header?.headerMobileColor};
            }
            .nav-style {
              background: ${navigation?.backgroundColor};
              color: ${navigation?.textColor};
              border-color: ${navigation?.borderColor};
            }
            .nav-dropdown-style {
              background: ${navigation?.dropdownBg};
              color: ${navigation?.dropdownTextColor};
            }
            .topbar-style {
              background: ${header?.topbarBackground};
              color: ${header?.topbarColor};
            }
            .footer-style {
              background: ${footer?.backgroundColor};
              color: ${footer?.textColor};
            }
            .copyright-style {
              background: ${footer?.copyrightBg};
              color: ${footer?.copyrightColor};
              border-color: ${footer?.copyrightBorderColor};
            }
            .btn-primary {
              background-color: ${primaryButton?.backgroundColor};
              color: ${primaryButton?.textColor};
              border-color: ${primaryButton?.borderColor};
            }
            .btn-secondary {
              background-color: ${secondaryButton?.backgroundColor};
              color: ${secondaryButton?.textColor};
              border-color: ${secondaryButton?.borderColor};
            }
            @media (min-width: 64em) {
              .text-heading1 {
                font-size: ${typography?.fontHeading1};
              }
              .text-heading2 {
                font-size: ${typography?.fontHeading2};
              }
              .text-heading3 {
                font-size: ${typography?.fontHeading3};
              }
              .text-heading4 {
                font-size: ${typography?.fontHeading4};
              }
            }
          `,
      }}
    />
  );
}
