<?xml version="1.0" encoding="utf-8"?>
<xsl:transform version="1.0"
               xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
               xmlns:f="http://gov.ns.ca/features"
               exclude-result-prefixes="f"
><xsl:output method="xml" omit-xml-declaration="yes" indent="yes"/>
<xsl:strip-space elements="*"/>

<xsl:param name="PHOTOPATH"><xsl:choose>
	<xsl:when test="/f:features/@photos"><xsl:value-of select="/f:features/@photos"/></xsl:when>
	<xsl:otherwise>features/photos/</xsl:otherwise>
</xsl:choose></xsl:param>

<xsl:template match="f:features">
	<div class="features" aria-live="polite" aria-atomic="false">
		<xsl:if test="@id"><xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute></xsl:if>
		<xsl:if test="@defaultduration"><xsl:attribute name="data-duration"><xsl:value-of select="@defaultduration"/></xsl:attribute></xsl:if>
		<xsl:for-each select="f:feature"
			><xsl:apply-templates select="document(concat('content/', @id, '.xml'),.)/f:feature"
		><xsl:with-param name="duration" select="@duration"/></xsl:apply-templates></xsl:for-each>
		<xsl:comment>⁠<xsl:value-of select="count(f:feature)"/> feature(s)</xsl:comment>
	</div>
</xsl:template>

<xsl:template match="f:feature">
	<xsl:param name="duration"/>
	<xsl:variable name="defaulthref"><xsl:call-template name="getdefaulthref"/></xsl:variable>
	<xsl:variable name="pubdate" select="f:published/@date"/>
	<article class="feature">
		<xsl:if test="$duration"><xsl:attribute name="data-duration"><xsl:value-of select="$duration"/></xsl:attribute></xsl:if>
		<a class="featurePhoto" href="{$defaulthref}"><img src="{$PHOTOPATH}{@id}.jpg" alt="{f:photo/@alt}" title="{f:photo/@cutline}" /></a>
		<div class="featureOverlay">
			<div class="featureContent">
				<h1 class="featureTitle" title="{f:title} ({$pubdate})"><a href="{$defaulthref}"><xsl:value-of select="f:title"/></a></h1>
				<time pubdate="pubdate" datetime="{$pubdate}" class="featurePublished"><xsl:value-of select="$pubdate"/></time>
				<div class="featureSummary">
					<p><xsl:value-of select="f:summary"/></p>
				</div>
				<xsl:apply-templates select="f:links"/>
			</div>
			<div class="featureBack"></div>
			<div class="featureNext"></div>
		</div>
	</article>
</xsl:template>

<xsl:template name="getdefaulthref"
><xsl:for-each select="f:links/*[position()=1]"><xsl:choose>
	<xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when>
	<xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise>
</xsl:choose></xsl:for-each
></xsl:template>

<xsl:template match="f:links">
	<ul class="featureLinks">
		<xsl:apply-templates select="*"/>
	</ul>
</xsl:template>

<xsl:template match="f:release[@lang='en']" mode="text">Read the release</xsl:template>
<xsl:template match="f:release[@lang='fr']" mode="text">Communiqué de presse</xsl:template>
<xsl:template match="f:release" mode="href">http://gov.ns.ca/news/details.asp?id=<xsl:value-of select="@id"/></xsl:template>
<xsl:template match="f:smr" mode="text">Social Media Release</xsl:template>
<xsl:template match="f:smr" mode="href">http://gov.ns.ca/news/smr/<xsl:choose><xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when><xsl:otherwise><xsl:value-of select="../../@id"/></xsl:otherwise></xsl:choose>/</xsl:template>
<xsl:template match="f:video" mode="text">Watch the Video</xsl:template>

<xsl:template match="f:release|f:smr|f:link">
	<xsl:variable name="text"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="text"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="href"><xsl:choose><xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="lang"><xsl:choose><xsl:when test="@lang"><xsl:value-of select="@lang"/></xsl:when><xsl:otherwise>en</xsl:otherwise></xsl:choose></xsl:variable>
	<li>
		<xsl:attribute name="class">featureLinkItem <xsl:value-of select="local-name()"/>FeatureLink</xsl:attribute>
		<a href="{$href}" class="featureLink" hreflang="{$lang}" lang="{$lang}"><xsl:value-of select="$text"/></a>
	</li>
</xsl:template>

</xsl:transform>
