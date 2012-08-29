<?php
error_reporting(-1);
require_once($_SERVER['DOCUMENT_ROOT'].'/code/functions.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/code/class/xmltransformer.class.php');

class FeatureFeed {
	public $xmlns = 'http://www.w3.org/2005/Atom';
	protected $dom = null;
	protected $filename = '';
	function __construct($filename) {
		$this->dom = new DOMDocument();
		$this->dom->load(mapPath($filename));
		$this->filename = basename($filename);
		$xmlbase = $this->getXmlBase();
		if (!$xmlbase) {
			$xmlbase = 'http://novascotia.ca' . dirname(dirname($_SERVER['SCRIPT_NAME'])) . '/';
			$this->dom->documentElement->setAttribute('xml:base', $xmlbase);
		}
		#echo "Loaded feed:\n" . $this->toString() . "\n";
	}
	function getXmlBase() {
		return $this->dom->documentElement->getAttribute('xml:base');
	}
	function getEntryIDs() {
		$nodelist = $this->dom->getElementsByTagNameNS($this->xmlns, 'entry');
		$l = $nodelist->length;
		$entries = array();
		for ($i=0; $i < $l; $i++) {
			$entrytag = $nodelist->item($i);
			$id = preg_split('/[:\/#]+/', $entrytag->getElementsByTagNameNS($this->xmlns, 'id')->item(0)->textContent);
			$entries[] = basename($id[count($id)-1]);
		}
		return $entries;
	}
	function findSelf() { // return <link rel="self" .../> element, or null
		for ($node = $this->dom->documentElement->firstChild; $node; $node = $node->nextSibling)
			if (($node->nodeType==1) && ($node->tagName=='link') && ($node->namespaceURI==$this->xmlns) && ($node->getAttribute('rel')=='self'))
				break;
		return $node;
	}
	function getFilename() { return $this->filename; }
	function resetFeedElements() {
		$root = $this->dom->documentElement;
		$removeTags = array('entry', 'id', 'updated');
		#echo "Removing entries\n";
		foreach($removeTags as $rm) {
			$nodelist = $root->getElementsByTagNameNS($this->xmlns, $rm);
			for($i = $nodelist->length; $i--;) {
				$e = $nodelist->item($i);
				$e->parentNode->removeChild($e);
			}
		}
		#echo "Removing extra whitespace\n";
		while ($root->lastChild && ($root->lastChild->nodeType==3))
			$root->removeChild($root->lastChild);
		#echo "adding extra linefeed\n";
		$root->appendChild($this->dom->createTextNode("\n"));
		$ID = $this->dom->createElementNS($this->xmlns, 'id');
		#$xmlbase = $this->dom->createTextNode($this->getXmlBase();
		$ID->appendChild($this->dom->createTextNode($this->getXmlBase() . $this->filename));
		$root->appendChild($ID);
		$root->appendChild($this->dom->createTextNode("\n"));
		$linkrelself = $this->findSelf();
		if (!$linkrelself) {
			$linkrelself = $this->dom->createElementNS($this->xmlns, 'link');
			$linkrelself->setAttribute('rel', 'self');
			$root->appendChild($linkrelself);
			$root->appendChild($this->dom->createTextNode("\n"));
		}
		$linkrelself->setAttribute('href', $this->filename);
		$updated = $this->dom->createElementNS($this->xmlns, 'updated');
		$updated->appendChild($this->dom->createTextNode(date(DATE_W3C)));
		$root->appendChild($updated);
		$root->appendChild($this->dom->createTextNode("\n\n"));
	}
	/*function addEntry($entryElement) {
		$this->dom->documentElement->appendChild($this->dom->importNode($entryElement, TRUE));
		$this->dom->documentElement->appendChild($this->dom->createTextNode("\n\n"));
	}*/
	function addEntry($id) {
		$entry = $this->dom->documentElement->appendChild($this->dom->createElementNS($this->xmlns, 'entry'));
		$idtag = $entry->appendChild($this->dom->createElementNS($this->xmlns, 'id'));
		$idtag->appendChild($this->dom->createTextNode($id));
	}
	
	function toString() {
		return $this->dom->saveXML();
	}
};

function hfs($s) { return htmlspecialchars($s, ENT_COMPAT, 'UTF-8'); }

function displayForm($feed) {
	$entries = $feed->getEntryIDs();
	$add = getQuery('add', false);
?>
	<form action="index.php" method="post">
		<h1><label for="lineup">Feature Line-up:</label></h1>
		<small>(Enter feature IDs, one per line)</small>
		<textarea id="lineup" name="lineup" rows="10" cols="60"><?php
			if (($add) && (!in_array($add, $entries)))
				echo $add."\n";
			foreach ($entries as $entry) {
				echo $entry."\n";
			}
		?></textarea>
		<input type="Submit" value="Download <?php echo $feed->getFilename(); ?>" />
	</form>
<?php
}

function showPage($feed) {
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>Feature Line-up</title>
	<style type="text/css">
		.clear { clear: both; }
	</style>
</head>
<body>
	<p>
		<a href="new.php">Create a new Feature</a>
	</p>
	<?php displayForm($feed); ?>

</body>
</html>
<?php
}

function getQuery($name, $fallback='') {
	return isset($_GET[$name]) ? $_GET[$name] : $fallback;
}

function getPost($name, $fallback='') {
	return isset($_POST[$name]) ? $_POST[$name] : $fallback;
}

function generateNewFeed($feed) {
	#header('Content-type: text/plain; charset=utf-8');
	try {
		$feed->resetFeedElements();
		$lineup = preg_split('/\s+/', getPost('lineup', ''));
		$xt = new XMLTransformer();
		$xt->loadStylesheet("/code/features/features-atom.xsl");
		//$xt->set('feed', createXMLDOM($feed->toString())->documentElement);
		$xt->set("CONTENTPATH", mapPath("../content/"));
		foreach ($lineup as $feature) {
			$feature = trim($feature);
			if ($feature) {
				#echo "Add Feature $feature\n";
				//$entry = $xt->transformData("../content/".$feature.".xml")->getDOM();
				#echo $entry->saveXML();
				//$feed->addEntry($entry->documentElement);
				$feed->addEntry($feature);
				#echo "Done with ".$entry->xmlEncoding.".\n";
			}
		}
		$xt->transformData($feed->toString());
		$output = '<'.'?xml version="1.0" encoding="utf-8"?' . ">\n" . normalizeLineEndings($xt->toString(), "\n");
		$ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
		$subtype = preg_match('/Version\/5[.0-9]*\sSafari/', $ua) ? 'octet-stream' : 'atom+xml';
		header('Content-type: application/' . $subtype);
		header('Content-disposition: attachment;filename=' . $feed->getFilename());
		echo $output;
		#echo $feed->toString();
		#echo "DONE.\n";
	} catch(Exception $e) {
		echo "<pre>" . $e->getMessage() . "</pre>\n";
	}
}

try {
	/*if (chdir('..'))
		echo getcwd() . "\n";
	else
		echo "chdir failed. :(\n";*/
	$feed = new FeatureFeed("../features.atom");
	
	if($_SERVER['REQUEST_METHOD']=='POST')
		generateNewFeed($feed);
	else
		showPage($feed);
} catch (Exception $e) {
	echo "<pre>" . $e->getMessage() . "</pre>\n";
}
?>