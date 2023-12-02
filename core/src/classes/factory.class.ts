import { NailyWatermark, ScopeOptions } from "../constants";
import { Injectable } from "../decorators";
import { Type } from "../typings";
import { NailyRegistry } from "./registry.class";

@Injectable()
export class NailyFactory<Instance extends Object = Object> {
  constructor(private readonly target: Type<Instance>) {}

  public getParamtypes<T extends any[]>(): T {
    return Reflect.getMetadata("design:paramtypes", this.target) || [];
  }

  public getIOCMetadatas(): NIOC.Metadata.Bean | undefined {
    return Reflect.getMetadata(NailyWatermark.BEAN, this.target);
  }

  public getIOCMetadatasOrThrow(): NIOC.Metadata.Bean {
    const metadatas = this.getIOCMetadatas();
    if (!metadatas) throw new Error(`Cannot get metadata of ${this.target.name}`);
    return metadatas;
  }

  public getPrototypeKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target.prototype) || [];
  }

  public getStaticKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target) || [];
  }

  public createInstance(): Instance {
    const metadata = this.getIOCMetadatasOrThrow();
    const prototypeKeys = this.getPrototypeKeys();

    if (metadata.Scope === ScopeOptions.Singleton && NailyRegistry.map.has(metadata.Token)) {
      return NailyRegistry.map.get(metadata.Token).instance as Instance;
    }

    prototypeKeys.forEach((key) => {
      const propertyMetadata = Reflect.getMetadata(NailyWatermark.BEAN, this.target.prototype, key);
      if (propertyMetadata) {
        const propertyFactory = new NailyFactory(propertyMetadata.Token);
        const propertyInstance = propertyFactory.createInstance();
        this.target.prototype[key] = propertyInstance;
      }
    });

    const instance = new this.target(...this.transformParamtypesToParameters());
    return instance;
  }

  private transformParamtypesToParameters(): Object[] {
    return this.getParamtypes().map((paramtype) => {
      return new NailyFactory(paramtype).createInstance();
    });
  }
}
