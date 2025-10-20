import groq from 'groq';

export const COLOR_THEME = groq`
  _id,
  typography {
    fontSize,
    fontHeading1,
    fontHeading2,
    fontHeading3,
    fontHeading4,
  },
  body {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
  },
  header {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "headerMobileBg": headerMobileBg[0].hex,
    "headerMobileColor": headerMobileColor[0].hex,
    "topbarBackground": topbarBackground[0].hex,
    "topbarColor": topbarColor[0].hex,
  },
  footer {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "copyrightBg": copyrightBg[0].hex,
    "copyrightColor": copyrightColor[0].hex,
    "copyrightBorderColor": copyrightBorderColor[0].hex,
  },
  navigation {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "borderColor": borderColor[0].hex,
    "dropdownBg": dropdownBg[0].hex,
    "dropdownTextColor": dropdownTextColor[0].hex,
  },
  primaryButton {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "borderColor": borderColor[0].hex,
  },
  secondaryButton {
    "backgroundColor": background[0].hex,
    "textColor": textColor[0].hex,
    "borderColor": borderColor[0].hex,
  }
`;
