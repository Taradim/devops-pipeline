import time
import random

def timer_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Time taken: {end_time - start_time} seconds")
        return result
    return wrapper

@timer_decorator
def brew_tea(tea_type: str) -> str:
    print(f"Brewing {tea_type} tea...")
    time.sleep(random.randint(1, 3))
    print(f"Tea {tea_type} is brewed.")

@timer_decorator
def brew_coffee(coffee_type: str) -> str:
    print(f"Brewing {coffee_type} coffee...")
    time.sleep(random.randint(2, 4))
    print(f"Coffee {coffee_type} is brewed.")


brew_tea("green")
brew_coffee("espresso")

dict={
    "tea": brew_tea,
    "coffee": brew_coffee,
}


class Solution:
    def isHappy(self, n: int) -> bool:
        l = []
        summ = 0

        while n not in l and n != 1:

            while n // 10 !=0:
                summ += (n%10)**2
                n = n//10
            summ += n**2

            if summ == 1:
                return True
            if summ in l:
                return False
            else :
                l.append(summ)
                n = summ
            print(summ)

Solution().isHappy(19)