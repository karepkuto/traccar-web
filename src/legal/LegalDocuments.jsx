import { Typography } from '@mui/material';
import { getDocuments } from './legalContent';

const LegalDocuments = ({ manager = true }) => (
  <>
    {getDocuments()
      .filter((document) => manager || !document.managerOnly)
      .map((document) => (
        <section key={document.id} id={document.id}>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            {document.title}
          </Typography>
          {document.sections.map((section) => (
            <div key={`${document.id}-${section.heading}`}>
              {section.heading && (
                <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
                  {section.heading}
                </Typography>
              )}
              {section.paragraphs.map((paragraph) => (
                <Typography key={paragraph} variant="body2" sx={{ mt: 0.75 }}>
                  {paragraph}
                </Typography>
              ))}
            </div>
          ))}
        </section>
      ))}
  </>
);

export default LegalDocuments;
