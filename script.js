'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// Function que borra e inserta los datos en el html
const displayMovements = function (movements, sort = false) {
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  containerMovements.innerHTML = '';
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Function que sumas todos los datos de transferencia
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)} EUR`;
};

// Function de suma para los datos de intereses, entrada,
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const outCalc = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outCalc.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      console.log(int, arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

// Funcion para el login del nombre
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsername(accounts);

const updateUI = function (acc) {
  displayMovements(acc.movements);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  // Comprobamos si la contrasena en el input es igual a la de el objeto.
  if (currentAccount?.pin === +inputLoginPin.value) {
    console.log('login');

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 1;

    inputLoginUsername.value = inputLoginPin.value = '';

    inputLoginPin.blur();

    // Actualizacion de los datos
    updateUI(currentAccount);
  }
});

// Esta function transfiere los datos a otra cuenta.
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  //Este if else comprueba los datos por posibles datos repetidos o datos que no coincidan
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // agregando datos a movements
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputLoanAmount.value;

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    //Update UI
    updateUI(currentAccount);
    inputLoanAmount.value = '';
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

console.log(currentAccount);

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

// Pruebas de el curso !!!!
// Probando metodos
console.log(accounts);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const withdrawals = movements.filter(mov => mov < 0);

console.log(withdrawals);

const euroTotal = 1.1;

const movementsUSD = movements.map(function (mov) {
  return mov * euroTotal;
});

console.log(movements);
console.log(movementsUSD);

const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);

const max = movements.reduce((acc, mov) => {
  if (acc > mov) {
    return acc;
  } else {
    return mov;
  }
}, movements[0]);

console.log(max);

const ages = [5, 2, 4, 1, 15, 8, 3];

const calcAverageHumanage = ages => {
  const humanAges = ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(mayor => mayor >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
  return humanAges;
};

const avg1 = calcAverageHumanage(ages);
console.log(avg1);

// TODO: function recieves age. Age to be multiplied by (2 >= * 2, 2 < + (n + 16) * 4) then exclude from array any < 18

const calc = ages => {
  let a = ages.map(el => (el <= 2 ? el * 2 : el * 4 + 16));
  return a.filter(el => el >= 18);
};

console.log(calc([5, 2, 4, 1, 15, 8, 3]));

const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * euroTotal)
  .reduce((acc, mov) => acc + mov, 0);

const firstWithDrawal = movements.find(mov => mov < 0);
console.log(movements);
console.log(firstWithDrawal);

const latestLargeMovementIndex = movements.findLastIndex(
  mov => Math.abs(mov) > 1000
);

console.log(latestLargeMovementIndex);
console.log(
  `Your latest large movement was ${latestLargeMovementIndex} movements ago`
);

console.log(movements.includes(-130));

const anyDeposits = movements.some(mov => mov > 1500);
console.log(anyDeposits);

console.log(movements.every(mov => mov > 0));
console.log(account2.movements.every(mov => mov > 0));

const accountMovements = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(accountMovements);

const accountMovements2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(accountMovements2);

const breeds = [
  {
    breed: 'German Shepherd',
    averageWeight: 32,
    activities: ['fetch', 'swimming'],
  },
  {
    breed: 'Dalmatian',
    averageWeight: 24,
    activities: ['running', 'fetch', 'agility'],
  },
  {
    breed: 'Labrador',
    averageWeight: 28,
    activities: ['swimming', 'fetch'],
  },
  {
    breed: 'Beagle',
    averageWeight: 12,
    activities: ['digging', 'fetch'],
  },
  {
    breed: 'Husky',
    averageWeight: 26,
    activities: ['running', 'agility', 'swimming'],
  },
  {
    breed: 'Bulldog',
    averageWeight: 36,
    activities: ['sleeping'],
  },
  {
    breed: 'poodle',
    averageWeight: 18,
    activities: ['agility', 'fetch'],
  },
];

// 1
const huskyWeight = breeds.find(breed => breed.breed === 'Husky').averageWeight;
console.log(huskyWeight);

// 2.
const dogBothActivities = breeds.find(
  breed =>
    breed.activities.includes('fetch') && breed.activities.includes('running')
);
console.log(dogBothActivities);

//3
const allActivities = breeds.flatMap(breed => breed.activities);
console.log(allActivities);

//4
const uniqueActives = [...new Set(allActivities)];
console.log(uniqueActives);

//5
const swimmingAdjacent = breeds
  .filter(breed => breed.activities.includes('swimming'))
  .flatMap(breed => breed.activities);

//6
console.log(breeds.every(breed => breed.averageWeight > 10));

// 7
console.log(breeds.some(breed => breed.activities.length >= 3));

// 8 Bonus
const max2 = breeds
  .filter(breed => breed.activities.includes('fetch'))
  .map(breed => breed.averageWeight);
const max3 = Math.max(...max2);
console.log(max2);
console.log(max3);

const owners = ['jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners);

console.log(movements);

// Ascending
movements.sort((a, b) => a - b);
console.log(movements);
// Descending

movements.sort((a, b) => b - a);
console.log(movements);

const gropedMovements = Object.groupBy(movements, movement =>
  movement > 0 ? 'Deposits' : 'Withdrawals'
);
console.log(gropedMovements);

const groupedByActivity = Object.groupBy(accounts, account => {
  const movementAccount = account.movements.length;

  if (movementAccount >= 8) return 'Very Active';
  if (movementAccount >= 4) return 'Active';
  if (movementAccount >= 1) return 'Moderate';
  return 'inactive';
});

console.log(groupedByActivity);

const arr = [1, 2, 3, 4, 5, 6, 7, 8];

const groupedAccounts = Object.groupBy(accounts, ({ type }) => type);
console.log(groupedAccounts);

const x = new Array(8);
console.log(x.fill(1));

arr.fill(23, 4, 7);
console.log(arr);

const y = Array.from({ length: 7 }, () => 1);
console.log(y);

const z = Array.from({ length: 100 }, (_, i) =>
  Math.trunc(Math.random() * 100)
);
console.log(z);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementsUI);
});

+(
  // Me devuelve los datos alrevez pero reverse muta el elemento origen
  console.log(movements)
);
const reversedMov = movements.slice().reverse();
console.log(movements);
console.log(reversedMov);

//Devuelve los datos al revez y no muta el elemento origen
const reversedMov2 = movements.toReversed();
console.log(reversedMov2);

const newMovements = movements.with(1, 2000);
console.log(newMovements);
console.log(movements);

const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
console.log(bankDepositSum);

const numDeposits1000 = accounts
  .flatMap(mov => mov.movements)
  .filter(mov1 => mov1 >= 1000).length;
console.log(numDeposits1000);

const reduceDeposit = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

const sums = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );

console.log(sums);

const converTittleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'and', 'on', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');
  return capitalize(titleCase);
};
console.log(converTittleCase('This is a nice title'));
console.log(converTittleCase('and here is another'));

const dogs = [
  { weight: 22, curFood: 284, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

//1
dogs.flatMap(calc => (calc.recFood = Math.floor(calc.weight ** 0.75 * 28)));
console.log(dogs);

// 2

const dogSarah = dogs.find(dog => dog.owners.includes('sarah'));
console.log(
  `Sarah tu perro come ${dogSarah > dogs.recFood ? 'mucho' : 'Poco'}`
);

//3
const ownersEatTooMuch = dogs
  .filter(current => current.curFood > current.recFood)
  .flatMap(all => all.owners);

const ownersEatTooLite = dogs
  .filter(current => current.curFood < current.recFood)
  .flatMap(all => all.owners);

//4
console.log(
  `${ownersEatTooMuch.join(
    ' '
  )} Estos perros estan comiendo mucho ${ownersEatTooLite.join(
    ' '
  )} estos perros estan comiendo muy poco`
);

// 5
console.log(dogs.some(dog => dog.curFood === dog.recFood));

// 6
const checkEatingOkay = dog =>
  dog.curFood < dog.recFood * 1.1 && dog.curFood > dog.recFood * 0.9;
console.log(dogs.every(checkEatingOkay));

// 7
const dogEatingOkay = dogs.filter(checkEatingOkay);
console.log(dogEatingOkay);

// 8
const pepe = dogs.toSorted((a, b) => b.recFood - a.recFood);
console.log(pepe);

// ParseInt = convierte una string numerica en numero !parsefloat! = lo mismo pero con decimales
// isNaN = te devuelve un valor booleano dependiendo si el elemento es nan o no !isFinite! = te devuelve un booleano si tiene un numero es true si no es false

console.log(Number.isFinite(20));

console.log(Math.sqrt(25));
// Devuelve 25 dividido

console.log(Math.max(1, 6, 9, 21, 12, 24));
console.log(Math.min(1, 2, 4, 6, 8, 9, 12));

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

console.log(randomInt(10, 20));

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

console.log(Math.trunc(23.3));
console.log(Math.trunc(23.9));

// Devuelve el dato con un arreglo decimal o completo.
console.log((2.7).toFixed(0));
console.log((2.345).toFixed(4));

console.log(5 % 2);
