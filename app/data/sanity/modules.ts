import groq from 'groq';

import {MODULE_BANNER_GRID} from './modules/bannerGrid';
import {MODULE_BANNER_SLIDER} from './modules/bannerSlider';
import {MODULE_SELECTED_PRODUCT} from './modules/selectedProduct';
import {MODULE_IMAGE_HOTSPOT} from './modules/imageHotspot';
import {MODULE_COLLECTION_TABS} from './modules/collectionTabs';
import {MODULE_LATEST_BLOG} from './modules/latestBlog';
import {MODULE_VIDEO_BACKGROUND} from './modules/videoBackground';
import {MODULE_FEATURED_POLICIES} from './modules/fearuredPolicies';
import {MODULE_IMAGE_WITH_TEXT} from './modules/imageWithText';
import {MODULE_INSTAGRAM} from './modules/instagram';
import {MODULE_GOOGLE_MAP} from './modules/googleMap';
import {MODULE_CONTACT_FORM} from './modules/contactForm';
import {MODULE_FAQS} from './modules/faqs';
import {MODULE_CONTENT_GRID} from './modules/contentGrid';
import {MODULE_HTML_CONTENT} from './modules/htmlContent';
import {MODULE_COLLECTION_GRID} from './modules/collectionGrid';

export const MODULES = groq`
  _key,
  _type,
  (_type == "imageHotspot") => {
    ${MODULE_IMAGE_HOTSPOT}
  },
  (_type == "bannerSlider") => {
    ${MODULE_BANNER_SLIDER}
  },
  (_type == "bannerGrid") => {
    ${MODULE_BANNER_GRID}
  },
  (_type == "selectedProducts") => {
    ${MODULE_SELECTED_PRODUCT}
  },
  (_type == "imageWithText") => {
    ${MODULE_IMAGE_WITH_TEXT}
  },
  (_type == "collectionTabs") => {
    ${MODULE_COLLECTION_TABS}
  },
  (_type == "contentGrid") => {
    ${MODULE_CONTENT_GRID}
  },
  (_type == "latestBlog") => {
    ${MODULE_LATEST_BLOG}
  },
  (_type == "videoBg") => {
    ${MODULE_VIDEO_BACKGROUND}
  },
  (_type == "policies") => {
    ${MODULE_FEATURED_POLICIES}
  },
  (_type == "instagram") => {
    ${MODULE_INSTAGRAM}
  }, 
  (_type == "googleMap") => {
    ${MODULE_GOOGLE_MAP}
  },
  (_type == "contactForm") => {
    ${MODULE_CONTACT_FORM}
  },
  (_type == "faqs") => {
    ${MODULE_FAQS}
  },
  (_type == "htmlContent") => {
    ${MODULE_HTML_CONTENT}
  },
  (_type == "collectionGrid") => {
    ${MODULE_COLLECTION_GRID}
  },
`;
