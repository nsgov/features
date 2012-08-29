<?xml version="1.0" encoding="utf-8"?>
<xsl:transform version="1.0"
               xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
               xmlns:feature="http://novascotia.ca/features/v1"
               xmlns:atom="http://www.w3.org/2005/Atom"
               xmlns="http://www.w3.org/2005/Atom"
               exclude-result-prefixes="atom"
><xsl:output method="xml" omit-xml-declaration="no" indent="yes"/>
<xsl:strip-space elements="*"/>

<xsl:param name="BASEURI"><xsl:for-each select="/atom:feed/@*"><xsl:if test="name()='xml:base'"><xsl:value-of select="."/></xsl:if></xsl:for-each></xsl:param>
<xsl:param name="CONTENTPATH" select="concat($BASEURI, 'content/')"/>
<xsl:param name="PHOTOSURL"   select="concat($BASEURI, 'photos/')"/>
<xsl:variable name="LANG" select="/atom:feed/@xml:lang"/>

<!-- copy nodes without children with copy-of, so that msxml makes them self-closing tags -->
<xsl:template match="/atom:feed/*[not(*)]">
	<xsl:copy-of select="."/>
</xsl:template>
<!-- copy everything else the normal way -->
<xsl:template match="@*|node()">
	<xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy>
</xsl:template>

<xsl:template match="atom:entry">
	<xsl:apply-templates select="document(concat($CONTENTPATH,atom:id,'.xml'))/feature:feature">
		<xsl:with-param name="duration" select="feature:duration/@seconds"/>
	</xsl:apply-templates>
</xsl:template>

<xsl:template match="feature:feature">
	<xsl:variable name="lang"><xsl:call-template name="getLang"/></xsl:variable>
	<xsl:variable name="summary" select="normalize-space(feature:summary)"/>
	<entry xml:lang="{$lang}">
		<id><xsl:value-of select="$BASEURI"/>#<xsl:value-of select="@id"/></id>
		<title><xsl:value-of select="feature:title"/></title>
		<published><xsl:value-of select="feature:published/@datetime"/></published>
		<updated><xsl:value-of select="feature:updated/@datetime"/></updated>
		<summary><xsl:value-of select="$summary"/></summary>
		<link type="image/jpeg" rel="enclosure" href="{$PHOTOSURL}{@id}.jpg" title="{feature:photo/@alt}" feature:cutline="{feature:photo/@cutline}"/>
		<xsl:apply-templates select="feature:links/*"/>
		<content type="xhtml">
			<div xmlns="http://www.w3.org/1999/xhtml">
				<img src="{$PHOTOSURL}{@id}.jpg" title="{feature:photo/@cutline}" alt="{feature:photo/@alt}"/>
				<p><xsl:value-of select="$summary"/></p>
				<xsl:apply-templates select="feature:links"/>
			</div>
		</content>
	</entry>
</xsl:template>

<xsl:template match="feature:release" mode="text">Read the release</xsl:template>
<xsl:template match="feature:release[lang('fr')]" mode="text">Communiqué de presse</xsl:template>
<xsl:template match="feature:release" mode="href">http://novascotia.ca/news/details.asp?id=<xsl:value-of select="@id"/></xsl:template>
<xsl:template match="feature:smr" mode="text">Social Media Release</xsl:template>
<xsl:template match="feature:smr" mode="href">http://novascotia.ca/news/smr/<xsl:choose><xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when><xsl:otherwise><xsl:value-of select="../../@id"/></xsl:otherwise></xsl:choose>/</xsl:template>
<xsl:template match="feature:video" mode="text">Watch the Video</xsl:template>

<xsl:template match="feature:links">
	<ul xmlns="http://www.w3.org/1999/xhtml">
		<xsl:apply-templates select="*" mode="html"/>
	</ul>
</xsl:template>

<xsl:template name="getLang"><xsl:choose>
		<xsl:when test="ancestor-or-self::*[@xml:lang]"><xsl:value-of select="ancestor-or-self::*[@xml:lang][1]/@xml:lang"/></xsl:when>
		<xsl:otherwise>en</xsl:otherwise>
</xsl:choose></xsl:template>

<xsl:template match="feature:release|feature:smr|feature:link|feature:video">
	<xsl:variable name="text"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="text"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="href"><xsl:choose><xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="lang"><xsl:call-template name="getLang"/></xsl:variable>
	<xsl:variable name="rel"><xsl:choose><xsl:when test="position()=1">alternate</xsl:when><xsl:otherwise>related</xsl:otherwise></xsl:choose></xsl:variable>
	<link feature:linktype="{local-name()}" rel="{$rel}" href="{$href}" hreflang="{$lang}" xml:lang="{$lang}" title="{$text}" />
</xsl:template>

<xsl:template match="feature:release|feature:smr|feature:link|feature:video" mode="html">
	<xsl:variable name="text"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="text"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="href"><xsl:choose><xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="lang"><xsl:call-template name="getLang"/></xsl:variable>
	<li xmlns="http://www.w3.org/1999/xhtml"><a href="{$href}" hreflang="{$lang}" lang="{$lang}"><xsl:value-of select="$text"/></a></li>
</xsl:template>

</xsl:transform>
