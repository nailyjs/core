import { Injectable } from '@nailyjs/ioc'
import { IPipeContext } from '../contexts/pipe-context'

export interface Pipe {
  transform(value: any, context: IPipeContext): any
}

export const Pipe = Injectable
