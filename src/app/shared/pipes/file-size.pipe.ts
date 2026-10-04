import { Pipe, PipeTransform } from '@angular/core';
import { formatSize } from '../utils/file-size.utils';

@Pipe({
  name: 'fileSize',
  pure: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes?: number | null): string {
    return formatSize(bytes);
  }
}
