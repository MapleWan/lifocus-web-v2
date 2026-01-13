function testAnimal(animal) {
    return animal;
}
function testCat(cat) {
    return cat;
}
testAnimal({ name: 'animal' });
testCat({ name: 'cat', run: function () { } });
