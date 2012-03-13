<?php

function getPost($name, $fallback='') {
	return isset($_POST[$name]) ? $_POST[$name] : $fallback;
}

function echoPost($name, $fallback='') {
	echo htmlspecialchars(getPost($name, $fallback));
}

function displayForm() {
	$ymd = date('Y-m-d');
?>
	<h1>Create New Feature Content</h1>
	<ul>
		<li>Fill in the form, unused fields can be left blank</li>
		<li>Photo:<ul>
			<li>Scale/crop the image
				<small>(<em>512</em>✕<em>288</em>px for most pages, <em>625</em>✕<em>352</em>px for gov homepage)</small></li>
			<li>The filename should be the same as the feature ID + .jpg</li>
			<li>Upload it to your features/photos/ folder</li>
		</ul></li>
		<li>If there is a Social Media Release, make the feature ID the same as the SMR ID</li>
		<li>Download the XML file, and upload it to your features/content/ directory</li>
		<li>Edit features/features.xml to put it in rotation.</li>
	</ul>
	<form action="./" method="post">
		<dl>
			<dt>ID:</dt>
			<dd><input type="text" name="id" value="<?php echoPost('id', $ymd.'-keyword');?>" maxlength="50"/></dd>
			
			<dt>Title:</dt>
			<dd><input type="text" name="title" value="<?php echoPost('title');?>" maxlength="50"/></dd>

			<dt>Publish Date:</dt>
			<dd><input type="text" name="date" value="<?php echoPost('date', $ymd);?>" maxlength="10"/></dd>

			<!--dt>Publish Time:</dt>
			<dd><input type="text" name="time" value="<?php echoPost('time');?>" maxlength="10"/></dd-->

			<dt>Summary:</dt>
			<dd><textarea name="summary"><?php echoPost('summary');?></textarea></dd>
			
			<!--dt>Keywords:</dt>
			<dd><input type="text" name="keywords" value="<?php echoPost('keywords');?>" maxlength="250"/></dd-->

			<dt>Cutline:</dt>
			<dd><input type="text" name="cutline" value="<?php echoPost('cutline');?>" maxlength="250"/></dd>

			<dt>Alt Text:</dt>
			<dd><input type="text" name="alt" value="<?php echoPost('alt');?>" maxlength="250"/></dd>

			<dt>Links:</dt>
			<dd class="releases">
				<h2>News Releases:</h2>
				<p>English: details.asp?id=<input type="text" name="release_en" value="<?php echoPost('release_en');?>" maxlength="11"/></p>
				<p>Français: details.asp?id=<input type="text" name="release_fr" value="<?php echoPost('release_fr');?>" maxlength="11"/></p>
				<p>SMR? <input type="checkbox" name="smr" <?php echo (getPost('smr')?'checked="checked"':'');?> /></p>
				<div class="other">
					Other:
					<dl>
						<dt>text:</dt><dd><input type="text" name="linktext" value="<?php echoPost('linktext'); ?>" maxlength="50"/></dd>
						<dt>href:</dt><dd><input type="text" name="linkhref" alue="<?php echoPost('linkhref'); ?>" /></dd>
					</dl>
					<br class="clear"/>
				</div>
			</dd>

		</dl>
		<div class="actions">
			<input type="submit" value="Download XML"/>
		</div>
	</form>
<?php
}

function generateXML()
{
	$date = getPost('date', date('Y-m-d'));
	//$keywords = preg_split('/\s+/', trim(getPost('keywords')));
	//$id = $date . '-' . (count($keywords) ? $keywords[0] : 'feature');
	$id = getPost('id', $date.'-feature');
	header("Content-type: text/xml");
	header("Content-disposition: attachment;filename=".$id.'.xml');
	?><featurestory id="<?php echo $id;?>" xmlns="http://gov.ns.ca/features">
	<title><?php echoPost('title'); ?></title>
	<published date="<?php echo $date; ?>"/>
	<summary>
		<?php echoPost('summary'); ?>

	</summary>
	<photo alt="<?php echoPost('alt'); ?>"
	       cutline="<?php echoPost('cutline')?>"/>
<?php
	if(getPost('release_en')) { ?>
	<release lang="en" id="<?php echoPost('release_en'); ?>"/>
<?php }
	if(getPost('release_fr')) { ?>
	<release lang="fr" id="<?php echoPost('release_fr'); ?>"/>
<?php }
	if(getPost('smr')) { ?>
	<smr/>
<?php }
	if(getPost('linkhref')) { ?>
	<link href="<?php echoPost('linkhref'); ?>" title="<?php echoPost('linktext'); ?>"/>
<?php  } ?>
</featurestory>
<?php
}

function showPage() {
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Create Feature Story</title>
	<style type="text/css">
		input[type="text"] {
			width: 512px;
		}
		p input[type="text"] {
			width: 150px;
		}
		textarea {
			width: 512px;
			height: 5em;
		}
		dt {
			background: #789;
			clear: both;
			color: white;
			float: left;
			padding: 3px;
			width: 7em;
		}
		dd {
			float: left;
			border: 4px solid #789;
			margin: 0 0 1em 0;
		}
		.other {
			border: 2px solid #ccc;
			margin: 1em;
		}
		.actions {
			clear: both;
		}
		.clear { clear: both; }
	</style>
</head>
<body>
	<?php displayForm(); ?>
</body>
</html>
<?php }

if($_SERVER['REQUEST_METHOD']=='POST')
	generateXML();
else
	showPage();
