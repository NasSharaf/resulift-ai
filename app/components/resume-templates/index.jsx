// components/ResumeTemplates/index.js
import { BaseTemplate } from './BaseTemplate';
import { EvenTemplate } from './EvenTemplate';
import { PaperTemplate } from './PaperTemplate';
import { FlatTemplate } from './FlatTemplate';
import { OnePageTemplate } from './OnePageTemplate';
import { ElegantTemplate } from './ElegantTemplate';

export const TEMPLATES = {
  even: EvenTemplate,
  paper: PaperTemplate,
  onepage: OnePageTemplate,
  elegant: ElegantTemplate,
  flat: FlatTemplate
};

