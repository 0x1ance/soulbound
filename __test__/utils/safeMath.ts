import Decimal from 'decimal.js'

type Input = number | string | Decimal 

export const SafeMath = {
  add(num1: Input, num2: Input) {
    return new Decimal(num1).add(new Decimal(num2)).toNumber()
  },

  sub(num1: Input, num2: Input) {
    return new Decimal(num1).sub(new Decimal(num2)).toNumber()
  },

  mul(num1: Input, num2: Input) {
    return new Decimal(num1).mul(new Decimal(num2)).toNumber()
  },

  div(num1: Input, num2: Input) {
    return new Decimal(num1).div(new Decimal(num2)).toNumber()
  },
}
