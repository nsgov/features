<?xml version="1.0" encoding="utf-8"?>
<xsl:transform version="1.0"
               xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
               xmlns:atom="http://www.w3.org/2005/Atom"
               xmlns:f="http://novascotia.ca/features/v1"
               exclude-result-prefixes="atom f"
><xsl:output method="xml" omit-xml-declaration="yes" indent="yes"/>
<xsl:strip-space elements="*"/>

<xsl:template match="atom:feed">
	<div class="features">
		<xsl:if test="f:duration/@seconds"><xsl:attribute name="data-duration"><xsl:value-of select="f:duration/@seconds"/></xsl:attribute></xsl:if>
		<xsl:apply-templates select="atom:entry"/>
		<xsl:comment>⁠<xsl:value-of select="count(atom:entry)"/> feature(s)</xsl:comment>
	</div>
</xsl:template>

<xsl:template match="atom:entry">
	<xsl:variable name="duration" select="f:duration/@seconds"/>
	<xsl:variable name="defaulthref"><xsl:call-template name="getdefaulthref"/></xsl:variable>
	<xsl:variable name="datetime" select="atom:published"/>
	<xsl:variable name="pubdate" select="substring($datetime, 1, 10)"/>
	<xsl:variable name="photo" select="atom:link[@rel='enclosure']"/>
	<article class="feature">
		<xsl:if test="$duration"><xsl:attribute name="data-duration"><xsl:value-of select="$duration"/></xsl:attribute></xsl:if>
		<a class="featurePhoto" href="{$defaulthref}"><img src="{$photo/@href}" alt="{$photo/@title}" title="{$photo/@f:cutline}" /></a>
		<div class="featureOverlay">
			<div class="featureContent">
				<h1 class="featureTitle" title="{atom:title} ({$pubdate})"><a href="{$defaulthref}"><xsl:value-of select="atom:title"/></a></h1>
				<time pubdate="pubdate" datetime="{$datetime}" class="featurePublished"><xsl:value-of select="$pubdate"/></time>
				<div class="featureSummary">
					<p><xsl:value-of select="atom:summary"/></p>
				</div>
				<ul class="featureLinks">
					<xsl:apply-templates select="atom:link[not(@rel='enclosure')]"/>
				</ul>
			</div>
			<div class="featureBack"></div>
			<div class="featureNext"></div>
		</div>
	</article>
</xsl:template>

<xsl:template name="getdefaulthref"
><xsl:value-of select="atom:link[not(@rel) or @rel='alternate']/@href"/></xsl:template>
<!--xsl:for-each select="f:links/*[position()=1]"><xsl:choose>
	<xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when>
	<xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise>
</xsl:choose></xsl:for-each
></xsl:template-->

<xsl:template match="atom:link">
	<xsl:variable name="text"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="text"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="href"><xsl:choose><xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="lang"><xsl:choose><xsl:when test="@xml:lang"><xsl:value-of select="@xml:lang"/></xsl:when><xsl:otherwise>en</xsl:otherwise></xsl:choose></xsl:variable>
	<li class="featureLinkItem {@f:linktype}FeatureLink">
		<a href="{@href}" class="featureLink" hreflang="{@hreflang}" lang="{$lang}"><xsl:value-of select="@title"/></a>
	</li>
</xsl:template>

</xsl:transform>
