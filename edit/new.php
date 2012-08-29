<?php

$ID_REGEX = '[A-Za-z0-9][-A-Za-z0-9]{0,48}[A-Za-z0-9]';
$RELEASE_REGEX = '(199[89]|20\d\d)(0\d|1[012])([012]\d|3[01])\d{3}';

$valid_field_patterns = array(
	'featureID' => $ID_REGEX,
	'title' => '.{1,80}',
	'summary' => '.{1,240}',
	'release_en' => $RELEASE_REGEX,
	'release_fr' => $RELEASE_REGEX,
	'smr' => $ID_REGEX
);

function getPost($name, $fallback='') {
	return isset($_POST[$name]) ? $_POST[$name] : $fallback;
}

function echoPost($name, $fallback='') {
	echo htmlspecialchars(getPost($name, $fallback), ENT_COMPAT, 'UTF-8');
}

function echopattern($id) {
	global $valid_field_patterns;
	echo htmlspecialchars($valid_field_patterns[$id]);
}

function displayForm() {
	$datetime = date(DATE_W3C);
	$ymd = substr($datetime, 0, 10);
?>
	<div id="container">
	<h1>Create a new Feature</h1>
	<form action="new.php" method="post">
	<ol id="steps">
	<li class="step">
		<h2>Content</h2>
		<div class="features">
			<article class="feature">
				<div class="featurePhoto">
				</div>
				<div class="featureOverlay">
				<fieldset class="featureContent">
					<legend>Main Content</legend>
					<h1 class="featureTitle">
						<label for="title">Title:</label>
						<input id="title" type="text" name="title" value="<?php echoPost('title');?>" maxlength="80" required="required" pattern="<?php echopattern('title');?>" />
					</h1>
					<div class="featureSummary">
						<label for="summary">Summary:</label>
						<textarea id="summary" name="summary" required="required" pattern="<?php echopattern('summary');?>"><?php echoPost('summary');?></textarea>
					</div>
				</fieldset>
				<div class="featureBack"></div>
				<div class="featureNext"></div>
				</div>
				<fieldset id="photofields">
					<legend>Photo</legend>
					<dl>
					<dt><label for="alt"><abbr title="Alternate text: useful for the visually impaired, as well as image indexing software such as Google image search.">Alt Text</abbr>:</label> <small>A short visual description of the photo.</small></dt>
					<dd><input id="alt" type="text" name="alt" value="<?php echoPost('alt');?>" maxlength="255" /></dd>

					<dt><label for="cutline">Cutline:</label> <small>An optional caption for the photo.</small></dt>
					<dd><input id="cutline" type="text" name="cutline" value="<?php echoPost('cutline');?>" maxlength="255" /></dd>
					</dl>
				</fieldset>
			</article>
		</div>
		<div id="photoID">
			<div id="featureIDbox">
				<label for="featureID">Feature ID:</label></dt>
				<input id="featureID" type="text" name="id" value="<?php echoPost('id', $ymd.'-keyword');?>" maxlength="50" required="required" pattern="<?php echopattern('featureID');?>"/></dd>
			</div>
			<div class="note">
				<h2>Photo:</h2>
				<ul>
					<li>Scale/crop the image <small>(512×288px for most pages, 625×352px for gov homepage)</small></li>
					<li>The photo filename should be <span id="photofilename">the Feature ID with a .jpg extension.</span></li>
				</ul>
				<p>Upload the image file to <a id="photolink" href="../photos/">your features/photos/ folder</a></p>
			</div>
		</div>
		<br style="clear: both;"/>
	</li>
	<li class="step">
		<h2>Links</h2>
		<fieldset id="editLinks">
			<div class="note"><ul>
				<li>Links are optional.  Leave blank any fields that don't apply.</li>
				<li>You can customize the links by editing the feature xml file after you download it:
				<ul>
					<li>The order of the links can be changed.</li>
					<li>The first link in the file is used as the href for the photo and the feature title.</li>
					<li>There is no limit to the number of links for any given link type. eg: There can be more than one SMR link.</li>
					<li>All tags in the links section support the title &amp; xml:lang attributes for overriding the default link text or language.</li>
				</ul></li>
			</ul></div>
			<dl>
			<dt>News Releases:</dt>
			<dd class="releases">
				<p><label for="release_en">English Release ID:</label>
					details.asp?id=<input id="release_en" type="text" name="release_en" value="<?php echoPost('release_en');?>" maxlength="11" pattern="<?php echopattern('release_en');?>" />
				</p>
				<p><label for="release_fr">en français:</label> details.asp?id=<input type="text" name="release_fr" value="<?php echoPost('release_fr');?>" maxlength="11" pattern="<?php echopattern('release_fr');?>" /></p>
			</dd>
			
			<dt>SMR</dt>
			<dd class="smr">
				<p><label for="smr">SMR ID:</label> /news/smr/<input id="smr" type="text" name="smr" <?php echo getPost('smr');?> maxlength="50" pattern="<?php echopattern('smr');?>" />/</p>
			</dd>
			<dt>Other</dt>
			<dd class="other">
					Other:
					<p>text: <input type="text" name="linktext" value="<?php echoPost('linktext'); ?>" maxlength="80"/></p>
					<p>href: <input type="url" name="linkhref" value="<?php echoPost('linkhref'); ?>" /></p>
			</dd>
			</dl>
		</fieldset>
	</li>
	<li class="step">
		<h2>The Feature XML File</h2>
		<div class="note">
			Upload the xml file to <a id="contentlink" href="../content/">your features/content/ folder.</a>
		</div>
		<div class="actions">
			<input id="downloadBtn" class="action" type="submit" value="Download XML"/>
		</div>
	</li>
	<li class="step">
		<h2>The Atom Feed</h2>
		<div class="note">
			The updated features.atom file will have to be uploaded to
			<a id="atomlink" href="../features.atom">your features/ folder.</a>
		</div>
		<div class="actions">
			<a id="lineuplink" href="index.php" class="action">Update line-up…</a>
		</div>
	</li>
	</ol>
	</form>
	</div>
<?php
}

function generateXML() {
	$datetime = date(DATE_W3C);
	$date = getPost('date', date('Y-m-d'));
	//$keywords = preg_split('/\s+/', trim(getPost('keywords')));
	//$id = $date . '-' . (count($keywords) ? $keywords[0] : 'feature');
	$id = getPost('id', $date.'-feature');
	header("Content-type: text/xml; charset=utf-8");
	header("Content-disposition: attachment;filename=".$id.'.xml');
	echo '<' . '?xml version="1.0" encoding="utf-8" ?' . '>';
	?>

<feature id="<?php echo $id;?>" xmlns="http://novascotia.ca/features/v1" xml:lang="en">
	<title><?php echoPost('title'); ?></title>
	<published datetime="<?php echo $datetime; ?>"/>
	<updated datetime="<?php echo $datetime; ?>"/>
	<summary>
		<?php echoPost('summary'); ?>

	</summary>
	<photo alt="<?php echoPost('alt'); ?>"
	       cutline="<?php echoPost('cutline')?>"/>
	<links>
<?php
	if(getPost('release_en')) { ?>
		<release xml:lang="en" id="<?php echoPost('release_en'); ?>"/>
<?php }
	if(getPost('release_fr')) { ?>
		<release xml:lang="fr" id="<?php echoPost('release_fr'); ?>"/>
<?php }
	if(getPost('smr')) { ?>
		<smr id="<?php echoPost('smr'); ?>"/>
<?php }
	if(getPost('linkhref')) { ?>
		<link href="<?php echoPost('linkhref'); ?>" title="<?php echoPost('linktext'); ?>"/>
<?php  } ?>
	</links>
</feature>
<?php
}

function showPage() {
	$cssfile = file_exists("edit.css") ? "edit.css" : "/clf/argyle/features/edit.css";
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>New Feature</title>
	<link rel="stylesheet" type="text/css" href="<?php echo $cssfile; ?>"/>
</head>
<body>
	<?php displayForm(); ?>
	<script type="text/javascript" src="/code/features/edit.js"></script>
</body>
</html>
<?php }

if($_SERVER['REQUEST_METHOD']=='POST')
	generateXML();
else
	showPage();
