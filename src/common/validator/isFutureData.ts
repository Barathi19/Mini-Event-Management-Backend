import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return false;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const inputDate = new Date(value);

          if (isNaN(inputDate.getTime())) return false;

          const now = new Date();

          return inputDate.getTime() >= now.getTime();
        },
        defaultMessage() {
          return 'Start time must be in the future';
        },
      },
    });
  };
}
