student = []
print("===== student management system ====")
print("1. Add student")
print("2. remove student")
print("3. search student")
print("4. show all students")
print("5. count students")
print("6. exit")
while True:
    choice = int(input("enter your choice:"))
    if choice == 1:
        name= input("enter the student name:")
        if name in student:
            print("student already exists")
        else:
            student.append(name)
            print("student added successfully!")
    elif choice ==2:
        name= input("enter student name:")
        if name in student:
            student.remove(name)
            print("student removed successfully")
        else:
            print("student not found")
    elif choice ==3:
        name= input("enter student name:")
        if name in student:
            print("student found")
        else:
            print("student not found")
    elif choice ==4:
        count = 1
        for name in student:
            print(count, name)
            count = count + 1
    elif choice ==5:
        print(len(student))
    elif choice == 6:
        break
    