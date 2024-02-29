import { CatchedErrorPlugin, InjectPropertyPlugin, InterceptMethodPlugin, ParameterPlugin } from "../plugins";
import { ImplNailyInterceptPlugin, ImplNailyPlugin, Type } from "../typings";
import { NailyContainer } from "./container.class";
import { InitFactory } from "./init.class";

export abstract class AbstractBootstrap<T> {
  constructor(private readonly rootService: Type<T>) {}
  private nailyContainer: NailyContainer;
  protected readonly plugins: ImplNailyPlugin[] = [];
  protected readonly interceptPlugins: ImplNailyInterceptPlugin[] = [];

  /**
   * ### Get Naily Container
   *
   * Get Naily Container instance.
   *
   * @return {NailyContainer}
   * @memberof AbstractBootstrap
   */
  public getNailyContainer(): NailyContainer {
    return this.nailyContainer;
  }

  /**
   * ### Load Naily Plugin
   *
   * @param {ImplNailyPlugin[]} plugins
   * @return {this}
   * @memberof AbstractBootstrap
   */
  public usePlugin(plugins: ImplNailyPlugin[]): this;
  public usePlugin(...plugins: ImplNailyPlugin[]): this;
  public usePlugin(plugin: ImplNailyPlugin[] | ImplNailyPlugin, ...plugins: ImplNailyPlugin[]) {
    if (Array.isArray(plugin)) {
      this.plugins.push(...plugin);
    } else {
      this.plugins.push(plugin, ...plugins);
    }
    return this;
  }

  /**
   * ### Use Intercept Plugin
   *
   * Use intercept plugin for Naily Intercept descorator.
   *
   * @param {...ImplNailyInterceptPlugin[]} plugins - Intercept plugin list
   * @return {this}
   * @memberof AbstractBootstrap
   */
  public useInterceptPlugin(...plugins: ImplNailyInterceptPlugin[]): this {
    this.interceptPlugins.push(...plugins);
    return this;
  }

  public enableInternalInterceptPlugin(): Omit<this, "enableInternalInterceptPlugin"> {
    return this.useInterceptPlugin(new CatchedErrorPlugin(), new ParameterPlugin());
  }

  /**
   * ### Enable Internal Plugin
   *
   * Quick enable internal plugin for Naily.
   *
   * #### Plugin List
   * * `InjectPropertyPlugin`: Inject property to a injectable class
   * * `InterceptMethodPlugin`: Intercept injectable class method to abstract `try/catch/finally`
   *
   * @return {this}
   * @memberof AbstractBootstrap
   */
  public enableInternalPlugin(): Omit<this, "enableInternalPlugin"> {
    return this.usePlugin(new InjectPropertyPlugin(), new InterceptMethodPlugin(this.interceptPlugins));
  }

  /**
   * ### Run Naily Application
   *
   * Run Naily Application and return the rootService instance.
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/02/26
   * @return {T}
   * @memberof AbstractBootstrap
   */
  public run(): any {
    this.nailyContainer = new NailyContainer(this.plugins);
    return new InitFactory<T>(this.rootService, this.nailyContainer, this.plugins).getInstance();
  }
}
