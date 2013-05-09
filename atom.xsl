<?xml version="1.0" encoding="utf-8"?>
<xsl:transform version="1.0"
               xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
               xmlns:atom="http://www.w3.org/2005/Atom"
               xmlns:f="http://novascotia.ca/features/v1"
               exclude-result-prefixes="atom f"
><xsl:output method="xml" omit-xml-declaration="yes" indent="no"/>
<xsl:strip-space elements="*"/>

<xsl:template match="atom:feed">
	<xsl:variable name="howmany" select="count(atom:entry)"/>
	<xsl:comment>features: <xsl:value-of select="atom:link[@rel='self']/@href"/> × atom.xsl = </xsl:comment>
	<div class="features" data-analytics="category={atom:title}">
		<xsl:if test="translate(f:duration/@autostart,'FALSE','false')='false'"><xsl:attribute name="data-autostart">0</xsl:attribute></xsl:if>
		<xsl:if test="f:duration/@seconds"><xsl:attribute name="data-duration"><xsl:value-of select="f:duration/@seconds"/></xsl:attribute></xsl:if>
		<xsl:apply-templates select="atom:entry"/>
		<xsl:comment><xsl:value-of select="$howmany"/> feature(s)</xsl:comment>
		<xsl:if test="$howmany &gt; 1">
		<div class="featureControls" aria-hidden="true">
			<xsl:apply-templates select="." mode="index"/>
			<button class="featureBackBtn"> </button>
			<button class="featureNextBtn"> </button>
		</div>
		</xsl:if>
	</div>
	<xsl:comment>/features</xsl:comment>
</xsl:template>

<xsl:template match="atom:entry">
	<xsl:variable name="mainlink" select="atom:link[not(@rel) or @rel='alternate']"/>
	<xsl:variable name="playable" select="atom:link[@f:linktype='video']"/>
	<xsl:variable name="playtype" select="$playable/@f:linktype"/>
	<xsl:variable name="playfullhost" select="substring-before(substring-after($playable/@href, '//'), '/')"/>
	<xsl:variable name="playhost"><xsl:choose><xsl:when test="starts-with($playfullhost, 'www.')"><xsl:value-of select="substring-after($playfullhost, 'www.')"/></xsl:when><xsl:otherwise><xsl:value-of select="$playfullhost"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="photohref"><xsl:choose><xsl:when test="$playable"><xsl:value-of select="$playable/@href"/></xsl:when><xsl:otherwise><xsl:value-of select="$mainlink/@href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="datetime" select="atom:published"/>
	<xsl:variable name="pubdate" select="substring($datetime, 1, 10)"/>
	<xsl:variable name="photo" select="atom:link[@rel='enclosure']"/>
	<xsl:variable name="label" select="substring-after(atom:id, '#')"/>
	<xsl:variable name="value" select="count(preceding-sibling::atom:entry)+1"/>
	<xsl:variable name="action"><xsl:choose><xsl:when test="$playable">Played <xsl:value-of select="$playtype"/></xsl:when><xsl:otherwise>Clicked photo</xsl:otherwise></xsl:choose></xsl:variable>
	<div class="feature" data-analytics="label={$label};value={$value}">
		<a class="featurePhoto" href="{$photohref}" data-analytics="action={$action}"
		 ><img src="{$photo/@href}" alt="{$photo/@title}" title="{$photo/@f:cutline}"
		 /><xsl:if test="$playable"><span class="featurePlayBtn" title="{$playable/@title}"> </span></xsl:if
		></a>
		<xsl:if test="$playable">
		<div class="featurePlayer"><button class="featurePlayerClose" title="Close {$playtype}">X</button></div>
		</xsl:if>
		<div class="featureOverlay">
			<div class="featureContent">
				<h1 class="featureTitle" title="{atom:title} ({$pubdate})"
				><a href="{$mainlink/@href}" data-analytics="action=Clicked headline"
				><xsl:value-of select="atom:title"
				/></a></h1>
				<time pubdate="pubdate" datetime="{$datetime}" class="featurePublished"><xsl:value-of select="$pubdate"/></time>
				<div class="featureSummary">
					<p><xsl:value-of select="atom:summary"/></p>
				</div>
				<ul class="featureLinks">
					<xsl:apply-templates select="atom:link[not(@rel='enclosure')]"/>
				</ul>
			</div>
			<div class="featureBack"> </div>
			<div class="featureNext"> </div>
		</div>
	</div>
</xsl:template>

<xsl:template match="atom:link">
	<xsl:variable name="text"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="text"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="href"><xsl:choose><xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="lang"><xsl:choose><xsl:when test="@xml:lang"><xsl:value-of select="@xml:lang"/></xsl:when><xsl:otherwise>en</xsl:otherwise></xsl:choose></xsl:variable>
	<li class="featureLinkItem {@f:linktype}FeatureLink">
		<a href="{@href}" class="featureLink" hreflang="{@hreflang}" lang="{$lang}"
		   data-analytics="action=Clicked {@f:linktype} ({$lang})"
		 ><xsl:value-of select="@title"/></a>
	</li>
</xsl:template>

<xsl:template match="atom:feed" mode="index">
	<ol class="featuresIndex">
		<xsl:for-each select="atom:entry">
		<li><button title="{atom:title} ({substring(atom:published,1,10)})">•</button></li>
		</xsl:for-each>
	</ol>
</xsl:template>

</xsl:transform>
