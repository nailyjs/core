import type { MetadataScanner } from '../metadata-scanner'
import type { FilterMetadata } from '../types'
import { FilterWatermark } from '../constant'

export class FilterMetadataWrapper {
  constructor(private readonly metadataScanner: MetadataScanner) {}

  getFilterOptions(): FilterMetadata {
    return this.metadataScanner.getClassWrapper().getMetadata(FilterWatermark) || { errors: [] }
  }

  getFilterErrors(): any[] {
    return this.getFilterOptions().errors || []
  }
}
