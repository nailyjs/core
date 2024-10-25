import type { ContainerProtocol } from './container-protocol'
import { Container } from './container'

export abstract class AbstractBootstrap extends Container implements ContainerProtocol {}
