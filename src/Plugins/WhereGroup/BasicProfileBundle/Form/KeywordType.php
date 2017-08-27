<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\CallbackTransformer;

/**
 * Class KeywordType
 * @package Plugins\WhereGroup\BasicProfileBundle\Form
 */
class KeywordType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, array('label' => 'Titel'))
            ->add('date', TextType::class, array('label' => 'Datum'))
            ->add('dateType', ChoiceType::class, array(
                'label' => 'Beschreibung',
                'choices' => array(
                    'creation'    => 'Erstellungsdatum',
                    'revision'    => 'Überarbeitung',
                    'publication' => 'Veröffentlichung'
                )
            ))
            ->add('keywords', TextareaType::class, array(
                'label'    => 'Schlüsselwörter',
                'required' => false,
            ));


        $builder->get('keywords')
            ->addModelTransformer(new CallbackTransformer(
                function ($keywords) {
                    return is_array($keywords) ? implode(', ', $keywords) : '';
                },
                function ($keywords) {
                    $keywords = explode(',', trim($keywords, ','));
                    $keywords = array_map('trim', $keywords);
                    return $keywords;
                }
            ));


        $builder->get('date')
            ->addModelTransformer(new CallbackTransformer(
                function ($date) {
                    return ($date instanceof \DateTime) ? $date->format('Y-m-d') : '';
                },
                function ($date) {
                    return \DateTime::createFromFormat('Y-m-d', $date);
                }
            ));
    }
}
