interface CategoryString extends String { }

interface ServiceCategory {
    //currentYear: number;
    list(): CategoryString[];
    isValid(category: CategoryString): boolean;
    isCompatible(eventCategory: CategoryString, playerCategory: CategoryString): boolean
    ofDate(date: Date): CategoryString;
    getAge(date: Date): number;
    compare(category1: CategoryString, category2: CategoryString): number;
}
