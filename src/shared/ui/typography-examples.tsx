// Typography Component Usage Examples

import { Typography } from '@/shared/ui';

export default function TypographyExamples() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Typography variant="headline" as="h4">
          Headline Example (h4)
        </Typography>
        <Typography variant="md" color="legal-text-sub">
          This is a medium paragraph with default styling.
        </Typography>
      </div>

      <div>
        <Typography variant="sm" color="legal-text-primary">
          Small text example with legal primary color
        </Typography>
        <Typography variant="xs" color="legal-text-sub" italic>
          Extra small italic text in sub color
        </Typography>
      </div>

      <div>
        <Typography 
          variant="md" 
          fontSize={18} 
          color="legal-primary" 
          weight="bold"
          align="center"
        >
          Custom sized bold centered text
        </Typography>
      </div>

      <div>
        <Typography variant="sm" underline uppercase>
          Underlined uppercase small text
        </Typography>
      </div>

      <div>
        <Typography 
          variant="h4" 
          fontFamily="dm-sans" 
          color="legal-text-primary"
          letterSpacing="-0.02em"
        >
          Headline with DM Sans font family
        </Typography>
      </div>
    </div>
  );
}