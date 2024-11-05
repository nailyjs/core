import type { ClassWrapper } from './wrappers/class-wrapper'
import { FilterWatermark, InjectableWatermark } from './constant'
import { FilterMetadataWrapper } from './wrappers/filter-options-wrapper'
import { InjectMetadataWrapper } from './wrappers/inject-options-wrapper'
import { InjectableMetadataWrapper } from './wrappers/injectable-options-wrapper'
import { PostConstructMetadataWrapper } from './wrappers/post-construct-options-wrapper'

export class MetadataScanner {
  constructor(private readonly classWrapper: ClassWrapper) {}

  getClassWrapper(): ClassWrapper {
    return this.classWrapper
  }

  isInjectable(): boolean {
    return this.classWrapper.hasMetadata(InjectableWatermark)
  }

  isFilter(): boolean {
    return this.classWrapper.hasMetadata(FilterWatermark)
  }

  private _injectableMetadata: InjectableMetadataWrapper | null = null
  getInjectableMetadata(cache: boolean = true): InjectableMetadataWrapper {
    if (this._injectableMetadata && cache) return this._injectableMetadata
    this._injectableMetadata = new InjectableMetadataWrapper(this)
    return this._injectableMetadata
  }

  private _injectMetadata: InjectMetadataWrapper | null = null
  getInjectMetadata(cache: boolean = true): InjectMetadataWrapper {
    if (this._injectMetadata && cache) return this._injectMetadata
    this._injectMetadata = new InjectMetadataWrapper(this)
    return this._injectMetadata
  }

  private _filterMetadata: FilterMetadataWrapper | null = null
  getFilterMetadata(cache: boolean = true): FilterMetadataWrapper {
    if (this._filterMetadata && cache) return this._filterMetadata
    this._filterMetadata = new FilterMetadataWrapper(this)
    return this._filterMetadata
  }

  getPostConstructMetadata(): PostConstructMetadataWrapper {
    return new PostConstructMetadataWrapper(this)
  }

  getConstructorParamTypes(): any[] {
    return this.getClassWrapper().getMetadata('design:paramtypes') || []
  }

  getMethodParamTypes(propertyKey: string | symbol): any[] {
    return this.getClassWrapper().getPropertyMetadata('design:paramtypes', propertyKey, true) || []
  }

  getPropertyType(propertyKey: string | symbol): any {
    return this.getClassWrapper().getPropertyMetadata('design:type', propertyKey, true)
  }
}
