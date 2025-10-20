import groq from 'groq';

export const MODULE_FAQS = groq`
    _key,
    faqTitle,
    faqItems[] {
        _key,
        question,
        answer
    }
`;
