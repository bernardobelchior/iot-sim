import { Builder, IEnvironment } from './builder'

export default () => {
  const environment = Builder();
  console.log(environment.things)
}