
var epeek_theme = function() {
    "use strict";

    var tree_theme = function (sT, div) {
	sT.layout("vertical");
	sT(div);
	setTimeout(function(){
	    console.log("GO");
// 	    sT.layout("vertical");
//	    sT.subtree(["chimp", "human", "fly"]);
//	    sT.subtree(["mouse", "human", "zebrafish"]);
//	    sT.subtree(["Homo_sapiens", "Mus_musculus", "Gorilla_gorilla"]);
	    sT.subtree(["human","fish"]);
//	    sT.subtree(["Microbat","Flying fox","Hedgehog","Shrew","Panda","Dog","Ferret","Cat","Cow","Pig","Alpaca","Dolphin","Horse"]);
 	    sT.update();
	}, 2000);
	setTimeout(function(){
	    console.log("GO");
//	    sT.subtree(["human", "mouse", "chimp", "fish", "fly"]);
	    sT.subtree(["mouse", "human", "zebrafish", "fugu"]);
//	    sT.subtree(["Microbat","Flying fox","Hedgehog","Shrew","Panda","Dog","Ferret","Cat","Cow","Pig","Alpaca","Dolphin","Horse","Sheep"]);
	    sT.update();
	}, 8000);
    };

    return tree_theme;
};
