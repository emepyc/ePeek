describe("epeek.misc.iteratorInt", function () {
    var i = epeek.misc.iteratorInt();
    it("Returns a callback", function () {
	assert.isDefined(i);
	assert.isFunction(i);
    });

    it("Starts with 0 by default", function () {
	assert.strictEqual(i(), 0);
    });

    it("Creates new values", function () {
	assert.strictEqual(i(), 1);
    });

    it("Can start from custom values", function () {
	var j = epeek.misc.iteratorInt(100);
	assert.strictEqual(j(), 100);
    });

});
