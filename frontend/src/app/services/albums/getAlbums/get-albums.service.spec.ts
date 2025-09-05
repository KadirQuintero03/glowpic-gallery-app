import { TestBed } from '@angular/core/testing';

import { GetAlbumsService } from './get-albums.service';

describe('GetAlbumsService', () => {
  let service: GetAlbumsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAlbumsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
