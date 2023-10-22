export class BaseModel {
  toJSON(): this {
    return Object.assign({}, this);
  }
}
