var tree_data = {"tree":{"events":{"type":"speciation"},"branch_length":0,"children":[{"events":{"type":"speciation"},"branch_length":0.290309,"children":[{"events":{"type":"duplication"},"branch_length":0.553716,"children":[{"sequence":{"location":"groupV:2282380-2283414","id":[{"source":"EnsEMBL","accession":"ENSGACP00000004057"}]},"branch_length":0.009886,"id":{"source":"EnsEMBL","accession":"ENSGACG00000003104"},"taxonomy":{"scientific_name":"Gasterosteus aculeatus","id":69293}},{"sequence":{"location":"groupIV:26610147-26611181","id":[{"source":"EnsEMBL","accession":"ENSGACP00000025919"}]},"branch_length":0.010517,"id":{"source":"EnsEMBL","accession":"ENSGACG00000019610"},"taxonomy":{"scientific_name":"Gasterosteus aculeatus","id":69293}}],"confidence":{"value":100,"type":"boostrap"},"taxonomy":{"scientific_name":"Gasterosteus aculeatus","id":69293}},{"sequence":{"location":"3:10019898-10027054","id":[{"source":"EnsEMBL","accession":"ENSORLP00000002154"}]},"branch_length":0.799164,"id":{"source":"EnsEMBL","accession":"ENSORLG00000001736"},"taxonomy":{"scientific_name":"Oryzias latipes","id":8090}}],"confidence":{"value":100,"type":"boostrap"},"taxonomy":{"scientific_name":"Smegmamorpha","id":129949}},{"events":{"type":"duplication"},"branch_length":0.967267,"children":[{"events":{"type":"duplication"},"branch_length":0.044409,"children":[{"sequence":{"location":"LG11:12303551-12304465","id":[{"source":"EnsEMBL","accession":"ENSLOCP00000005677"}]},"branch_length":0.053459,"id":{"source":"EnsEMBL","accession":"ENSLOCG00000004738"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}},{"sequence":{"location":"LG4:788515-789902","id":[{"source":"EnsEMBL","accession":"ENSLOCP00000001145"}]},"branch_length":0.077798,"id":{"source":"EnsEMBL","accession":"ENSLOCG00000001021"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}}],"confidence":{"value":63,"type":"boostrap"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}},{"sequence":{"location":"LG7:27649875-27652376","id":[{"source":"EnsEMBL","accession":"ENSLOCP00000017148"}]},"branch_length":0.008044,"id":{"source":"EnsEMBL","accession":"ENSLOCG00000013911"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}}],"confidence":{"value":63,"type":"boostrap"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}}],"taxonomy":{"scientific_name":"Neopterygii","id":41665}},"rooted":1,"id":"ENSGT00540000072363","type":"gene tree"};

describe ('tnt tree label', function () {

    it ("Exists and is called label", function () {
	assert.isDefined (tnt.tree.label);
    });

    describe ('label (base)', function () {

	var label = tnt.tree.label();

	it ('Throws error on width', function () {
	    assert.isDefined (label.width());
	    assert.isFunction (label.width());
	    assert.throws (function () {
		label.width()();
	    }, /Need a width callback/);
	});

	it ('Throws error on height', function () {
	    assert.isDefined (label.height());
	    assert.isFunction (label.height());
	    assert.throws (function () {
		label.height()();
	    }, /Need a height callback/);
	});

	it ('Throws error on display', function () {
	    assert.isDefined (label.display());
	    assert.isFunction (label.display());
	    assert.throws (function () {
		label.display()();
	    }, /Need a display callback/);
	});


    });

    describe ('label text', function () {

    });

    describe ('label img', function () {

    });

    describe ('label composite', function () {

    });

});
