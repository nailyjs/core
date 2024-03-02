export class NailyContainerConstant {
  public static readonly INJECTABLE = Symbol("__INJECTABLE__");
  public static readonly AUTOLOAD_METHOD_KEYS = Symbol("__AUTOLOAD_METHOD_KEYS__");

  public static readonly INJECT = Symbol("__INJECT__");
}

export const AutoInject = Symbol("__AUTO_INJECT__");

/**
 * ### Scope Enum
 *
 * - English
 *    - When being marked, the class is directly instantiated into the container
 *    - The class instantiated into the container after the parent class is instantiated
 *    - The class instantiated into the container before the boot loader starts
 *    - The class instantiated into the container after the boot loader starts
 *    - The class instantiated into the container at the moment it is used in another class
 *
 * - 中文
 *    - 被标记之后，直接实例化到容器中的类
 *    - 父类被实例化之后，子类一同实例化到容器中的类
 *    - 启动器启动前实例化到容器中的类
 *    - 启动器启动后实例化到容器中的类
 *    - 在其他的类中使用的一瞬间实例化到容器中的类
 */
export enum ScopeEnum {
  Autoload = "Autoload",
  OnInject = "OnInject",
  AfterInject = "AfterInject",
  BeforeBoot = "BeforeBoot",
  AfterBoot = "AfterBoot",
  Transient = "Transient",
}
