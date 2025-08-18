import { TestBed } from '@angular/core/testing';

import { UploadAlbumsService } from './upload-albums.service';

describe('UploadAlbumsService', () => {
  let service: UploadAlbumsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadAlbumsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
