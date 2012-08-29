<?xml version="1.0" encoding="utf-8"?>
<xsl:transform version="1.0"
               xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
               xmlns:feature="http://novascotia.ca/features/v1"
               xmlns="http://www.w3.org/2005/Atom"
><xsl:output method="xml" omit-xml-declaration="yes" indent="yes"/>
<xsl:strip-space elements="*"/>

<xsl:param name="PHOTOPATH"><xsl:choose>
	<xsl:when test="/feature:features/@photos"><xsl:value-of select="/feature:features/@photos"/></xsl:when>
	<xsl:otherwise>photos/</xsl:otherwise>
</xsl:choose></xsl:param>

<xsl:template match="feature:feature">
	<entry>
		<id>urn:novascotia-ca-feature:<xsl:value-of select="@id"/></id>
		<title><xsl:value-of select="feature:title"/></title>
		<published><xsl:value-of select="feature:published/@datetime"/></published>
		<updated><xsl:value-of select="feature:updated/@datetime"/></updated>
		<link rel="enclosure" type="image/jpeg" href="{$PHOTOPATH}{@id}.jpg"
		      title="{feature:photo/@cutline}"
		      feature:alt="{feature:photo/@alt}"/>
		<content><xsl:value-of select="feature:summary"/></content>
		<xsl:apply-templates select="feature:links/*"/>
	</entry>
</xsl:template>

<xsl:template match="feature:release[@lang='en']" mode="text">Read the release</xsl:template>
<xsl:template match="feature:release[@lang='fr']" mode="text">Communiqué de presse</xsl:template>
<xsl:template match="feature:release" mode="href">http://novascotia.ca/news/details.asp?id=<xsl:value-of select="@id"/></xsl:template>
<xsl:template match="feature:smr" mode="text">Social Media Release</xsl:template>
<xsl:template match="feature:smr" mode="href">http://novascotia.ca/news/smr/<xsl:choose><xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when><xsl:otherwise><xsl:value-of select="../../@id"/></xsl:otherwise></xsl:choose>/</xsl:template>
<xsl:template match="feature:video" mode="text">Watch the Video</xsl:template>

<xsl:template match="feature:release|feature:smr|feature:link|feature:video">
	<xsl:variable name="text"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="text"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="href"><xsl:choose><xsl:when test="@href"><xsl:value-of select="@href"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="href"/></xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="lang"><xsl:choose><xsl:when test="@lang"><xsl:value-of select="@lang"/></xsl:when><xsl:otherwise>en</xsl:otherwise></xsl:choose></xsl:variable>
	<xsl:variable name="rel"><xsl:choose><xsl:when test="position()=1">alternate</xsl:when><xsl:otherwise>related</xsl:otherwise></xsl:choose></xsl:variable>
	<link rel="{$rel}" href="{$href}" hreflang="{$lang}" xml:lang="{$lang}" title="{$text}" feature:linktype="{local-name()}"/>
</xsl:template>

</xsl:transform>
