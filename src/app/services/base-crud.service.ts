import { RequestService } from './request.service';
import { BaseDatatable } from '../models/datatables/base.datatable';
import { Injectable, Injector } from '@angular/core';
import { MongoObject } from '../models/mongo-object';

@Injectable({
  providedIn: 'root',
})
export class BaseCrudService<T> {
  protected path: string = '';
  protected requestService: RequestService;
  constructor(injector: Injector) {
    this.requestService = injector.get(RequestService);
  }

  create(data: T) {
    return this.requestService.postJSON<T>(this.path, { data });
  }

  update(_id: string, data: T) {
    let obj = data as MongoObject;
    delete obj._id;
    return this.requestService.patchJSON<T>(this.path + '/' + _id, {
      data: obj,
    });
  }

  getMany(data?: { q?: string; page?: number; limit?: number }) {
    return this.requestService.getJSON<BaseDatatable<T>>(this.path, { data });
  }

  getById(_id: string) {
    return this.requestService.getJSON<T>(this.path + '/' + _id);
  }

  delete(_id: string) {
    return this.requestService.deleteJSON<T>(this.path + '/' + _id);
  }
}
