import { Transform } from 'class-transformer';

export const TrimLowerCase = () =>
  Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

export const Trim = () =>
  Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : value,
  );
