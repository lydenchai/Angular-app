import { AbstractControl, FormGroup } from "@angular/forms";

type Dictionary = {
  [key: string]: AbstractControl;
};
export class TypeSafeFromGroup<
  ControlType extends Dictionary,
  ValueType = any
> extends FormGroup {
  constructor(controls: ControlType) {
    super(controls);
  }
  override value!: ValueType;
  override controls!: ControlType;
}
